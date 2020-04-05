import { flags } from '@oclif/command';
import {
    findAllFiles,
    loadMigrationScriptFilePaths,
    loadMigrationScripts
} from '../utils/fileUtils';
import getElasticsearchClient from '../utils/es/EsUtils';
import { MAPPING_HISTORY_INDEX_NAME, MigrateIndex, MigrationPlanContext } from '../model/types';
import { cli } from 'cli-ux';
import { migrate } from '../executor/migration/MigrationExecutor';
import AbstractCommand, { DefaultOptions } from '../AbstractCommand';

export default class Migrate extends AbstractCommand {
    static description = 'Migrates Elasticsearch index to the latest version.';
    static flags = {
        ...DefaultOptions,
        help: flags.help({ char: 'h' }),
        indexName: flags.string({ char: 'i', description: 'migration index name.', required: true })
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
            cli.error('Migration file not found.', { exit: 1 });
        }

        const migrationScripts = loadMigrationScripts(migrationFileParsedPath);
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
            cli.error('Migration failed.', { exit: 1 });
        }
    }
}
