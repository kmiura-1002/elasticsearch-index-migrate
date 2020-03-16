import { flags } from '@oclif/command';
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
import AbstractCommand, { DefaultOptions } from './AbstractCommand';

export default class Info extends AbstractCommand {
    static description = 'Prints the details and status information about all the migrations.';
    static flags = {
        ...DefaultOptions,
        indexName: flags.string({
            char: 'i',
            description: 'migration index name.',
            required: true
        })
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
        const results = await getElasticsearchClient(this.migrationConfig.elasticsearch)
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
            baseline: baselineVersion,
            lastResolved: '',
            lastApplied: ''
        };
        const infoService = new MigrationInfoExecutor(migrationScripts, results, context);

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
