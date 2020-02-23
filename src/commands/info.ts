import { Command, flags } from '@oclif/command';
import * as config from 'config';
import {
    findAllFiles,
    loadMigrationScriptFilePaths,
    loadMigrationScripts
} from '../utils/fileUtils';
import { MigrateIndex, MigrationInfoContext, MAPPING_HISTORY_INDEX_NAME } from '../model/types';
import getElasticsearchClient from '../utils/es/EsUtils';
import MigrationInfoExecutor from '../executor/info/MigrationInfoExecutor';
import makeDetail from '../utils/makeDetail';
import { cli } from 'cli-ux';

export default class Info extends Command {
    static description = 'Prints the details and status information about all the migrations.';
    static flags = {
        help: flags.help({ char: 'h' }),
        indexName: flags.string({ char: 'i', description: 'migration index name.', required: true })
    };

    async run() {
        const { flags } = this.parse(Info);
        const locations = config.get<string[]>('migration.locations');
        const baselineVersion = config.get<string>('migration.baselineVersion');
        const migrationFilePaths: string[] = findAllFiles(locations);
        const migrationFileParsedPath = loadMigrationScriptFilePaths(
            flags.indexName,
            migrationFilePaths
        );

        if (migrationFileParsedPath.length === 0) {
            this.error('Migration file not found.', { exit: 404 });
        }

        const migrationScripts = loadMigrationScripts(migrationFileParsedPath);
        const client = getElasticsearchClient();
        const results = await client
            .search<MigrateIndex>(MAPPING_HISTORY_INDEX_NAME, {
                query: {
                    term: {
                        // eslint-disable-next-line @typescript-eslint/camelcase
                        index_name: {
                            value: flags.indexName
                        }
                    }
                }
            })
            .catch((reason) => {
                this.error(reason, { exit: 500 });
            });
        const context: MigrationInfoContext = {
            outOfOrder: true,
            pending: true,
            missing: true,
            ignored: true,
            future: true,
            baseline: baselineVersion,
            lastResolved: '',
            lastApplied: ''
        };
        const infoService = new MigrationInfoExecutor(migrationScripts, results, context);

        infoService.refresh();
        cli.table(
            makeDetail(infoService.all()),
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
