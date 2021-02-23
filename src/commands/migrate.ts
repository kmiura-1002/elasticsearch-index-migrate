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
import AbstractCommand, { CommandOptions } from '../AbstractCommand';
import * as JSONDiffPatch from 'jsondiffpatch';
import { Delta } from 'jsondiffpatch';

export default class Migrate extends AbstractCommand {
    static description =
        'Migrate the index of Elasticsearch to the latest version based on the execution plan.';
    static flags = {
        ...CommandOptions,
        showDiff: flags.boolean({
            description:
                'Outputs the difference between before and after the migration at the end.',
            default: false
        })
    };

    async run() {
        const { flags } = this.parse(Migrate);
        await this.createHistoryIndex();
        const locations = this.migrationConfig.migration.locations;
        const baselineVersion = this.migrationConfig.migration.baselineVersion;
        const migrationFilePaths = findAllFiles(locations);
        const migrationFileParsedPath = loadMigrationScriptFilePaths(
            flags.indexName,
            migrationFilePaths
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
                                value: flags.indexName
                            }
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
        if (flags.showDiff && (await elasticsearchClient.exists({ index: flags.indexName }))) {
            beforeIndex = await elasticsearchClient.get({ index: flags.indexName });
        }
        const count = await migrate(
            flags.indexName,
            migrationScripts,
            results,
            context,
            this.migrationConfig.elasticsearch
        );
        if (flags.showDiff) {
            afterIndex = await elasticsearchClient.get({ index: flags.indexName });
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
