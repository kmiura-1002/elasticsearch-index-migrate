import { flags } from '@oclif/command';
import {
    findAllFiles,
    loadMigrationScriptFilePaths,
    loadMigrationScripts
} from '../utils/fileUtils';
import getElasticsearchClient, { usedEsVersion } from '../utils/es/EsUtils';
import { MAPPING_HISTORY_INDEX_NAME, MigrateIndex, MigrationPlanContext } from '../model/types';
import { cli } from 'cli-ux';
import { migrate } from '../executor/migration/MigrationExecutor';
import AbstractCommand, { DefaultOptions } from '../AbstractCommand';
import { createHistoryIndex } from '../executor/init/MigrationInitExecutor';

export default class Migrate extends AbstractCommand {
    static description =
        'Migrate the index of Elasticsearch to the latest version based on the execution plan.';
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
        const { flags } = this.parse(Migrate);
        const locations = this.migrationConfig.migration.locations;
        const baselineVersion = this.migrationConfig.migration.baselineVersion;
        const migrationFilePaths: string[] = findAllFiles(locations);
        const migrationFileParsedPath = loadMigrationScriptFilePaths(
            flags.indexName,
            migrationFilePaths
        );

        if (migrationFileParsedPath.length === 0) {
            cli.error('Migration file not found.');
            cli.exit(1);
        }

        const migrationScripts = loadMigrationScripts(migrationFileParsedPath, flags.indexName);
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
                    term: {
                        index_name: {
                            value: flags.indexName
                        }
                    }
                }
            })
            .catch((reason) => {
                cli.error(reason, { exit: 1 });
            });
        const context: MigrationPlanContext = {
            baseline: baselineVersion,
            lastResolved: '',
            lastApplied: ''
        };

        const count = await migrate(
            migrationScripts,
            results,
            context,
            this.migrationConfig.elasticsearch
        );
        if (count && count > 0) {
            cli.info(`Migration completed. (count: ${count})`);
        } else if (count === 0) {
            cli.info('There was no migration target.');
        } else {
            cli.error('Migration failed.');
            cli.exit(1);
        }
    }
}
