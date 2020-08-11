import { flags } from '@oclif/command';
import AbstractCommand, { DefaultOptions } from '../AbstractCommand';
import getElasticsearchClient, { usedEsVersion } from '../utils/es/EsUtils';
import { MAPPING_HISTORY_INDEX_NAME, MigrateIndex } from '../model/types';
import { cli } from 'cli-ux';
import { createHistoryIndex } from '../executor/init/MigrationInitExecutor';
import StopWatch from '../utils/StopWatch';

export default class Recovery extends AbstractCommand {
    static description = 'Delete failed migration history.';
    static flags = {
        ...DefaultOptions,
        indexName: flags.string({
            char: 'i',
            description: 'migration index name.',
            required: true
        }),
        init: flags.boolean({
            allowNo: true,
            description:
                'If the init command has not been executed in advance, the migration will be performed after initialization has been processed.',
            default: true
        })
    };

    async run() {
        const { flags } = this.parse(Recovery);
        const elasticsearchClient = getElasticsearchClient(this.migrationConfig.elasticsearch);
        const exists = await elasticsearchClient.exists(MAPPING_HISTORY_INDEX_NAME);

        if (flags.init && !exists) {
            cli.info('migrate_history index does not exist.');
            cli.info('Create a migrate_history index for the first time.');
            await createHistoryIndex(
                elasticsearchClient,
                usedEsVersion(this.migrationConfig.elasticsearch) ?? ''
            );
            cli.info('The creation of the index has been completed.');
        } else if (!exists) {
            cli.error(
                'Migration environment is not ready. Execute the init command. Or, run the command with "--init"'
            );
            cli.exit(1);
        }

        const results = await elasticsearchClient
            .search<MigrateIndex>(MAPPING_HISTORY_INDEX_NAME, {
                size: 10000,
                query: {
                    bool: {
                        must: [
                            {
                                term: {
                                    index_name: {
                                        value: flags.indexName
                                    }
                                }
                            },
                            {
                                term: {
                                    success: {
                                        value: 'false'
                                    }
                                }
                            }
                        ]
                    }
                }
            })
            .catch((reason) => {
                cli.error(reason);
                cli.exit(1);
            });

        if (results.length === 0) {
            cli.info('No history of failed migrations.');
        } else {
            cli.info(`${results.length} errors in the migration history.`);
            results.forEach((val) => cli.info(`Failed migration of ${val.script_name}.`));
            cli.info('I will delete the above history.');

            const sw = new StopWatch();
            sw.start();
            await elasticsearchClient
                .deleteDocument(MAPPING_HISTORY_INDEX_NAME, {
                    query: {
                        bool: {
                            must: [
                                {
                                    term: {
                                        index_name: {
                                            value: flags.indexName
                                        }
                                    }
                                },
                                {
                                    term: {
                                        success: {
                                            value: 'false'
                                        }
                                    }
                                }
                            ]
                        }
                    }
                })
                .catch((reason) => {
                    cli.error(reason);
                    cli.exit(1);
                });
            sw.stop();
            cli.info(`Finished! (time: ${sw.read()} ms)`);
        }
    }
}
