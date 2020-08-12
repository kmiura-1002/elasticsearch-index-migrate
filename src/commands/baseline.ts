import { flags } from '@oclif/command';
import AbstractCommand, { DefaultOptions } from '../AbstractCommand';
import getElasticsearchClient, { usedEsVersion } from '../utils/es/EsUtils';
import { MAPPING_HISTORY_INDEX_NAME, MigrateIndex } from '../model/types';
import { cli } from 'cli-ux';
import { createHistoryIndex } from '../executor/init/MigrationInitExecutor';
import { format } from 'date-fns';

export default class Baseline extends AbstractCommand {
    static description =
        'Create a baseline in migration_history if you were running Elasticsearch before the tool was implemented.';
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
        }),
        description: flags.string({
            char: 'd',
            description: 'Description to be saved to history.'
        })
    };

    async run() {
        const { flags } = this.parse(Baseline);
        const elasticsearchClient = getElasticsearchClient(this.migrationConfig.elasticsearch);
        const baselineVersion = this.migrationConfig.migration.baselineVersion;
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
                                    migrate_version: {
                                        value: baselineVersion
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
            cli.info('Baseline history does not exist.');
            cli.info(`Create baseline in ${baselineVersion}.`);
            await elasticsearchClient
                .postDocument(MAPPING_HISTORY_INDEX_NAME, {
                    index_name: flags.indexName,
                    migrate_version: baselineVersion,
                    description: flags.description ?? 'Migration baseline',
                    script_name: '',
                    script_type: '',
                    installed_on: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss"),
                    execution_time: 0,
                    success: true
                })
                .then((v) => {
                    cli.info(v);
                    cli.info(`Successfully created a baseline in ${baselineVersion}.`);
                })
                .catch((reason) => {
                    cli.error(reason);
                    cli.exit(1);
                });
        } else {
            cli.info('There is already a baseline history');
        }
    }
}
