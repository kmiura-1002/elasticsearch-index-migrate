import { Command, flags } from '@oclif/command';
import * as config from 'config';
import * as path from 'path';
import * as fs from 'fs';
import { findAllFiles } from '../utils/fileUtils';
import {
    MigrateIndex,
    ResolvedMigration,
    MigrationInfoContext,
    MAPPING_HISTORY_INDEX_NAME
} from '../model/types';
import getElasticsearchClient from '../utils/es/EsUtils';
import MigrationInfoService from '../executor/info/MigrationInfoService';
import dump from '../executor/info/MigrationInfoDumper';
import { cli } from 'cli-ux';

export default class Info extends Command {
    static description = 'Prints the details and status information about all the migrations.';
    static flags = {
        help: flags.help({ char: 'h' }),
        indexName: flags.string({ char: 'i', description: 'migration index name.', required: true })
    };

    async run() {
        const fileNameRegexp = /^([v][0-9]+.[0-9]+.[0-9]+)__([0-9a-zA-Z]+)/;
        const indexNameRegexp = /[-_]/;
        const { flags } = this.parse(Info);
        const locations = config.get<string[]>('migration.locations');
        const baselineVersion = config.get<string>('migration.baselineVersion');
        const migrationFilePaths: string[] = findAllFiles(locations);
        const migrationFileParsedPath = migrationFilePaths
            .filter((value) => {
                const parentPath = flags.indexName.split(indexNameRegexp).join('/');
                const migrationFilePath = path.parse(value);
                return (
                    migrationFilePath.dir.includes(parentPath) &&
                    migrationFilePath.dir.lastIndexOf(parentPath) + parentPath.length ===
                        migrationFilePath.dir.length
                );
            })
            .map(path.parse)
            .filter((value) => value.ext === '.json');

        if (migrationFileParsedPath.length === 0) {
            this.error('Migration file not found.', { exit: 404 });
        }

        const migrationScripts = migrationFileParsedPath.map((value) => {
            const resolvedMigration = JSON.parse(
                fs.readFileSync(path.join(value.dir, value.base), 'utf8')
            ) as ResolvedMigration;
            resolvedMigration.physicalLocation = value;
            const match = value.name.match(fileNameRegexp) as RegExpMatchArray;
            if (match !== null && match.length > 1) {
                resolvedMigration.version = match[1];
            }
            return resolvedMigration;
        });
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
        const infoService = new MigrationInfoService(migrationScripts, results, context);

        infoService.refresh();
        cli.table(
            dump(infoService.all()),
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
