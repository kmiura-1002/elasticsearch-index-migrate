import {
    findAllFiles,
    loadMigrationScriptFilePaths,
    loadMigrationScripts
} from '../utils/fileUtils';
import { MigrateIndex, MigrationPlanContext, MAPPING_HISTORY_INDEX_NAME } from '../model/types';
import getElasticsearchClient from '../utils/es/EsUtils';
import MigrationPlanExecutor from '../executor/plan/MigrationPlanExecutor';
import makeDetail from '../utils/makeDetail';
import { cli } from 'cli-ux';
import AbstractCommand, { CommandOptions } from '../AbstractCommand';

export default class Plan extends AbstractCommand {
    static description = 'Outputs the migration execution plan.';
    static flags = {
        ...CommandOptions
    };

    async run() {
        const { flags } = this.parse(Plan);
        await this.createHistoryIndex();
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

        const migrationScripts = loadMigrationScripts(migrationFileParsedPath);
        const elasticsearchClient = getElasticsearchClient(this.migrationConfig.elasticsearch);

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
