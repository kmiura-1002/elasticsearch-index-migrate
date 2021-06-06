import AbstractCommand, { CommandOptions } from '../AbstractCommand';
import getElasticsearchClient from '../utils/es/EsUtils';
import { MAPPING_HISTORY_INDEX_NAME, MigrateIndex } from '../model/types';
import { cli } from 'cli-ux';
import StopWatch from '../utils/StopWatch';

export default class Recovery extends AbstractCommand {
    static description = 'Delete failed migration history.';
    static flags = {
        ...CommandOptions
    };

    async run(): Promise<void> {
        const { flags } = this.parse(Recovery);
        await this.createHistoryIndex();
        const elasticsearchClient = getElasticsearchClient(this.migrationConfig.elasticsearch);

        const indexName = this.indexName(flags);
        const results = await elasticsearchClient
            .search<MigrateIndex>({
                index: MAPPING_HISTORY_INDEX_NAME,
                body: {
                    size: 10000,
                    query: {
                        bool: {
                            must: [
                                {
                                    term: {
                                        index_name: {
                                            value: indexName
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
                }
            })
            .catch((reason) => {
                cli.error(JSON.stringify(reason));
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
                .deleteDocument({
                    index: MAPPING_HISTORY_INDEX_NAME,
                    body: {
                        query: {
                            bool: {
                                must: [
                                    {
                                        term: {
                                            index_name: {
                                                value: indexName
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
                    }
                })
                .catch((reason) => {
                    cli.error(JSON.stringify(reason));
                    cli.exit(1);
                });
            sw.stop();
            cli.info(`Finished! (time: ${sw.read()} ms)`);
        }
    }
}
