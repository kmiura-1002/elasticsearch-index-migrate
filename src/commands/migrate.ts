import { flags } from '@oclif/command';
import {
    findAllFiles,
    loadMigrationScriptFilePaths,
    loadMigrationScripts
} from '../utils/fileUtils';
import getElasticsearchClient from '../utils/es/EsUtils';
import {
    MAPPING_HISTORY_INDEX_NAME,
    MigrateIndex,
    MigrationPlanContext,
    SimpleJson
} from '../model/types';
import { cli } from 'cli-ux';
import { migrate } from '../executor/migration/MigrationExecutor';
import AbstractCommand, { CommandOptions, HistoryIndexOptions } from '../AbstractCommand';
import * as JSONDiffPatch from 'jsondiffpatch';
import { Delta } from 'jsondiffpatch';
import { validMigrateTarget } from '../decorators/validMigrateTarget';

export default class Migrate extends AbstractCommand {
    static description =
        'Migrate the index of Elasticsearch to the latest version based on the execution plan.';
    static flags = {
        ...HistoryIndexOptions,
        ...CommandOptions,
        showDiff: flags.boolean({
            description:
                'Outputs the difference between before and after the migration at the end.',
            default: false
        })
    };
    static args = [
        // ToDo Set required:true if flags index are removed
        { name: 'name', description: 'migration index name.', required: false }
    ];

    @validMigrateTarget()
    async run(): Promise<void> {
        const { flags, args } = this.parse(Migrate);
        await this.createHistoryIndex();
        const locations = this.migrationConfig.migration.locations;
        const baselineVersion = this.migrationConfig.migration.baselineVersion;
        const migrationFilePaths = findAllFiles(locations);
        const indexVersion = flags['index-version'];
        const indexName = this.indexName(args, flags);
        const migrationFileParsedPath = loadMigrationScriptFilePaths(
            flags.indexName ?? args.name,
            migrationFilePaths,
            flags['natural-name'],
            indexVersion
        );
        let beforeIndex: SimpleJson = {};
        let afterIndex: SimpleJson = {};

        if (migrationFileParsedPath.length === 0) {
            cli.error('Migration file not found.');
            cli.exit(1);
        }

        const migrationScripts = loadMigrationScripts(migrationFileParsedPath);
        const elasticsearchClient = getElasticsearchClient(this.migrationConfig.elasticsearch);

        const results = await elasticsearchClient
            .search<MigrateIndex>({
                index: MAPPING_HISTORY_INDEX_NAME,
                body: {
                    size: 10000,
                    query: {
                        term: {
                            index_name: {
                                value: indexName
                            }
                        }
                    }
                }
            })
            .catch((reason) => {
                cli.error(JSON.stringify(reason), { exit: 1 });
            });
        const context: MigrationPlanContext = {
            baseline: baselineVersion,
            lastResolved: '',
            lastApplied: ''
        };
        if (flags.showDiff && (await elasticsearchClient.exists({ index: indexName }))) {
            beforeIndex = await elasticsearchClient.get({ index: indexName });
        }
        const count = await migrate(
            indexName,
            migrationScripts,
            results,
            context,
            this.migrationConfig.elasticsearch
        );
        if (flags.showDiff) {
            afterIndex = await elasticsearchClient.get({ index: indexName });
        }
        if (count && count > 0) {
            cli.info(`Migration completed. (count: ${count})`);
            if (flags.showDiff) {
                const diff = JSONDiffPatch.diff(beforeIndex, afterIndex);
                cli.info('Display of the result difference.');
                cli.info(JSONDiffPatch.console.format(diff as Delta, afterIndex));
            }
        } else if (count === 0) {
            cli.info('There was no migration target.');
        } else {
            cli.error('Migration failed.');
            cli.exit(1);
        }
    }
}
