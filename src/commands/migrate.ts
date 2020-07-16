import { flags } from '@oclif/command';
import {
    findAllFiles,
    loadMigrationScriptFilePaths,
    loadMigrationScripts
} from '../utils/fileUtils';
import getElasticsearchClient, { usedEsVersion } from '../utils/es/EsUtils';
import {
    MAPPING_HISTORY_INDEX_NAME,
    MigrateIndex,
    MIGRATION_TARGET_TYPES,
    MigrationPlanContext,
    SimpleJson
} from '../model/types';
import { cli } from 'cli-ux';
import { migrate } from '../executor/migration/MigrationExecutor';
import AbstractCommand, { DefaultOptions } from '../AbstractCommand';
import { createHistoryIndex } from '../executor/init/MigrationInitExecutor';
import * as JSONDiffPatch from 'jsondiffpatch';
import { Delta } from 'jsondiffpatch';
import * as path from 'path';

export default class Migrate extends AbstractCommand {
    static description =
        'Migrate the index of Elasticsearch to the latest version based on the execution plan.';
    static flags = {
        ...DefaultOptions,
        indexName: flags.string({
            char: 'i', // TODO rename n (name)
            description: 'migration index name or index template name(the name of the template).',
            required: true
        }),
        init: flags.boolean({
            allowNo: true,
            description:
                'If the init command has not been executed in advance, the migration will be performed after initialization has been processed.',
            default: true
        }),
        showDiff: flags.boolean({
            description:
                'Outputs the difference between before and after the migration at the end.',
            default: false
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
        const { flags } = this.parse(Migrate);
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
        let beforeIndex: SimpleJson = {};
        let afterIndex: SimpleJson = {};

        if (migrationFileParsedPath.length === 0) {
            cli.error('Migration file not found.');
            cli.exit(1);
        }

        const migrationScripts = loadMigrationScripts(
            migrationFileParsedPath /*, flags.indexName*/
        );
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
        if (flags.showDiff && (await elasticsearchClient.exists(flags.indexName))) {
            beforeIndex = await elasticsearchClient.get(flags.indexName);
        }
        const count = await migrate(
            flags.indexName,
            migrationScripts,
            results,
            context,
            this.migrationConfig.elasticsearch
        );
        if (flags.showDiff) {
            afterIndex = await elasticsearchClient.get(flags.indexName);
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
