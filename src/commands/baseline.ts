import { flags } from '@oclif/command';
import AbstractCommand, { CommandOptions, HistoryIndexOptions } from '../AbstractCommand';
import getElasticsearchClient from '../utils/es/EsUtils';
import { MAPPING_HISTORY_INDEX_NAME, MigrateIndex } from '../model/types';
import { cli } from 'cli-ux';
import { format } from 'date-fns';
import { validMigrateTarget } from '../decorators/validMigrateTarget';

export default class Baseline extends AbstractCommand {
    static description =
        'Create a baseline in migration_history if you were running Elasticsearch before the tool was implemented.';
    static flags = {
        ...HistoryIndexOptions,
        ...CommandOptions,
        description: flags.string({
            char: 'd',
            description: 'Description to be saved to history.'
        })
    };
    static args = [
        // ToDo Set required:true if flags index are removed
        { name: 'name', description: 'migration index name.', required: false }
    ];

    @validMigrateTarget()
    async run(): Promise<void> {
        const { flags, args } = this.parse(Baseline);
        await this.createHistoryIndex();
        const elasticsearchClient = getElasticsearchClient(this.migrationConfig.elasticsearch);
        const baselineVersion = this.migrationConfig.migration.baselineVersion;

        const indexName = this.indexName(args, flags);
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
                                        migrate_version: {
                                            value: baselineVersion
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
            cli.info('Baseline history does not exist.');
            cli.info(`Create baseline in ${baselineVersion}.`);
            await elasticsearchClient
                .postDocument({
                    index: MAPPING_HISTORY_INDEX_NAME,
                    body: {
                        index_name: indexName,
                        migrate_version: baselineVersion,
                        description: flags.description ?? 'Migration baseline',
                        script_name: '',
                        script_type: '',
                        installed_on: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss"),
                        execution_time: 0,
                        success: true
                    }
                })
                .then(() => {
                    cli.info(`Successfully created a baseline in ${baselineVersion}.`);
                })
                .catch((reason) => {
                    cli.error(JSON.stringify(reason));
                    cli.exit(1);
                });
        } else {
            cli.info('There is already a baseline history');
        }
    }
}
