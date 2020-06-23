import { flags } from '@oclif/command';
import {
    findAllFiles,
    loadMigrationScriptFilePaths,
    loadMigrationScripts
} from '../utils/fileUtils';
import {
    MigrateIndex,
    MigrationPlanContext,
    MAPPING_HISTORY_INDEX_NAME,
    MIGRATION_TARGET_TYPES
} from '../model/types';
import getElasticsearchClient, { usedEsVersion } from '../utils/es/EsUtils';
import MigrationPlanExecutor from '../executor/plan/MigrationPlanExecutor';
import makeDetail from '../utils/makeDetail';
import { cli } from 'cli-ux';
import AbstractCommand, { DefaultOptions } from '../AbstractCommand';
import { createHistoryIndex } from '../executor/init/MigrationInitExecutor';
import * as path from 'path';

export default class Plan extends AbstractCommand {
    static description = 'Outputs the migration execution plan.';
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
        type: flags.enum({
            description:
                'Selecting the target of the migration \nindex : Migration to an index\nindex_template : Migration of the index template',
            char: 't',
            default: 'index',
            options: [...MIGRATION_TARGET_TYPES]
        })
    };

    async run() {
        const { flags } = this.parse(Plan);
        const migrationType = flags.type === 'index' ? 'indices' : 'templates';
        const locations = this.migrationConfig.migration.locations.map((value) =>
            path.join(value, migrationType)
        );
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
                this.error(reason, { exit: 500 });
            });
        const context: MigrationPlanContext = {
            baseline: baselineVersion,
            lastResolved: '',
            lastApplied: ''
        };
        const service = MigrationPlanExecutor(migrationScripts, results, context);

        cli.table(
            makeDetail(service.all),
            {
                version: {},
                description: {},
                type: {},
                installedOn: {},
                state: {}
            },
            {
                printLine: this.log
            }
        );
    }
}
