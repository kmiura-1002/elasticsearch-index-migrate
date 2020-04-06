import * as fs from 'fs';
import * as path from 'path';
import getElasticsearchClient, { usedEsVersion } from '../utils/es/EsUtils';
import { ClusterStatuses, MAPPING_HISTORY_INDEX_NAME } from '../model/types';
import { cli } from 'cli-ux';
import AbstractCommand, { DefaultOptions } from '../AbstractCommand';

interface MappingData {
    settings: any;
    mappings: any;
}

export default class Init extends AbstractCommand {
    static description = 'Set up a migration environment.';
    static flags = {
        ...DefaultOptions
    };

    async run() {
        this.parse(Init);
        const client = getElasticsearchClient(this.migrationConfig.elasticsearch);
        const health = await client.healthCheck();

        if (health.status === ClusterStatuses.YELLOW) {
            cli.info('cluster status is yellow.');
        } else if (health.status === ClusterStatuses.RED) {
            cli.error('cluster status is red.');
            cli.exit(1);
        }
        cli.info('Start creating index for migrate.');

        const exists = await client.exists(MAPPING_HISTORY_INDEX_NAME);
        if (exists) {
            cli.info(`${MAPPING_HISTORY_INDEX_NAME} index already exists.`);
            cli.exit(1);
        }
        const esVersion = usedEsVersion(this.migrationConfig.elasticsearch);
        const mappingData = JSON.parse(
            fs.readFileSync(
                path.join(
                    __dirname,
                    '../../',
                    'mapping',
                    esVersion === '7' ? 'migrate_history_esV7.json' : 'migrate_history_esV6.json'
                ),
                {
                    encoding: 'utf-8'
                }
            )
        ) as MappingData;
        const ret = await client
            .createIndex(MAPPING_HISTORY_INDEX_NAME, mappingData)
            .catch((reason) => {
                cli.error(`Failed to create index: ${JSON.stringify(reason)}`, { exit: 1 });
                cli.exit(1);
            });
        if (ret.statusCode === 200) {
            cli.info('Finish creating index for migrate.');
        } else {
            cli.error('Failed to create index for migrate.', { exit: 1, code: ret.statusCode });
            cli.exit(1);
        }
    }
}
