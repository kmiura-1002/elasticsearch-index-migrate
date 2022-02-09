import { Command, flags } from '@oclif/command';
import { cli } from 'cli-ux';
import { format } from 'date-fns';
import { CreateMigrationHistoryIfNotExists } from '../../decorators/createMigrationHistory';
import { DefaultFlags, esConnectionFlags } from '../../flags/defaultCommandFlags';
import useElasticsearchClient from '../../client/es/ElasticsearchClient';
import { readOptions } from '../../flags/flagsLoader';
import { MIGRATE_HISTORY_INDEX_NAME, MigrateIndex } from '../../types';

export default class EsIndex extends Command {
    static description =
        'Create a baseline in migration_history if you were running Elasticsearch before the tool was implemented.';
    static flags = {
        ...esConnectionFlags,
        ...DefaultFlags,
        index: flags.string({
            char: 'i',
            description: 'migration index name.',
            required: true
        }),
        description: flags.string({
            char: 'd',
            description: 'Description to be saved to history.'
        })
    };

    @CreateMigrationHistoryIfNotExists()
    async run(): Promise<void> {
        const { flags } = this.parse(EsIndex);
        const migrationConfig = await readOptions(flags, this.config);
        const { search, postDocument } = useElasticsearchClient(migrationConfig.elasticsearch);
        const baselineVersion = migrationConfig.migration.baselineVersion;

        try {
            const results = await search<MigrateIndex>(
                historySearchParam(flags.index, baselineVersion[flags.index])
            );
            if (results.length === 0) {
                cli.info('Baseline history does not exist.');
                cli.info(`Create baseline in ${baselineVersion}.`);

                await postDocument(
                    historyDocumentParam({
                        index_name: flags.index,
                        migrate_version: baselineVersion[flags.index],
                        description: flags.description
                    })
                );
                cli.info(`Successfully created a baseline in ${baselineVersion}.`);
            } else {
                cli.info('There is already a baseline history');
            }
        } catch (e) {
            cli.error(JSON.stringify(e));
        }
    }
}

const historySearchParam = (index: string, baselineVersion: string) => ({
    index: MIGRATE_HISTORY_INDEX_NAME,
    body: {
        size: 10000,
        query: {
            bool: {
                must: [
                    {
                        term: {
                            index_name: {
                                value: index
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
});

const historyDocumentParam = (param: Partial<MigrateIndex>) => ({
    index: MIGRATE_HISTORY_INDEX_NAME,
    body: {
        index_name: param.index_name,
        migrate_version: param.migrate_version,
        description: param.description ?? 'Migration baseline',
        script_name: param.script_name ?? '',
        script_type: param.script_type ?? '',
        installed_on: param.installed_on ?? format(new Date(), "yyyy-MM-dd'T'HH:mm:ss"),
        execution_time: param.execution_time ?? 0,
        success: param.success ?? true,
        checksum: param.checksum
    }
});
