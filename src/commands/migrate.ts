import { Command, flags } from '@oclif/command';
import * as config from 'config';
import {
    findAllFiles,
    loadMigrationScriptFilePaths,
    loadMigrationScripts
} from '../utils/fileUtils';
import getElasticsearchClient from '../utils/es/EsUtils';
import { MAPPING_HISTORY_INDEX_NAME, MigrateIndex, MigrationInfoContext } from '../model/types';
import { cli } from 'cli-ux';
import { migrate } from '../executor/migration/MigrationExecutor';

export default class Migrate extends Command {
    static description = 'Migrates Elasticsearch index to the latest version.';
    static flags = {
        help: flags.help({ char: 'h' }),
        indexName: flags.string({ char: 'i', description: 'migration index name.', required: true })
    };

    async run() {
        const { flags } = this.parse(Migrate);
        const locations = config.get<string[]>('migration.locations');
        const baselineVersion = config.get<string>('migration.baselineVersion');
        const migrationFilePaths: string[] = findAllFiles(locations);
        const migrationFileParsedPath = loadMigrationScriptFilePaths(
            flags.indexName,
            migrationFilePaths
        );

        if (migrationFileParsedPath.length === 0) {
            cli.error('Migration file not found.', { exit: 404 });
        }

        const migrationScripts = loadMigrationScripts(migrationFileParsedPath);
        const results = await getElasticsearchClient()
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
                cli.error(reason, { exit: 500 });
            });
        const context: MigrationInfoContext = {
            baseline: baselineVersion,
            lastResolved: '',
            lastApplied: ''
        };

        const count = await migrate(migrationScripts, results, context);
        if (count) {
            cli.info(`Migration completed. (count: ${count})`);
        } else {
            cli.error('Migration failed.', { exit: 500 });
        }
    }
}
