import { flags } from '@oclif/command';
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
import AbstractCommand, { DefaultOptions } from '../AbstractCommand';

export default class Plan extends AbstractCommand {
    static description = 'Outputs the migration execution plan.';
    static flags = {
        ...DefaultOptions,
        indexName: flags.string({
            char: 'i',
            description: 'migration index name.',
            required: true
        })
    };

    async run() {
        const { flags } = this.parse(Plan);
        const locations = this.migrationConfig.migration.locations;
        const baselineVersion = this.migrationConfig.migration.baselineVersion;
        const migrationFilePaths: string[] = findAllFiles(locations);
        const migrationFileParsedPath = loadMigrationScriptFilePaths(
            flags.indexName,
            migrationFilePaths
        );

        if (migrationFileParsedPath.length === 0) {
            this.error('Migration file not found.', { exit: 1 });
        }

        const migrationScripts = loadMigrationScripts(migrationFileParsedPath, flags.indexName);
        const results = await getElasticsearchClient(this.migrationConfig.elasticsearch)
            .search<MigrateIndex>(MAPPING_HISTORY_INDEX_NAME, {
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
