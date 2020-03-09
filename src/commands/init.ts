import { Command, flags } from '@oclif/command';
import * as fs from 'fs';
import * as path from 'path';
import getElasticsearchClient from '../utils/es/EsUtils';
import { clusterStatus, MAPPING_HISTORY_INDEX_NAME } from '../model/types';
import { cli } from 'cli-ux';

interface MappingData {
    settings: any;
    mappings: any;
}

export default class Init extends Command {
    static description = 'Setup elasticsearch index migrate env';
    static flags = {
        help: flags.help({ char: 'h' })
    };

    async run() {
        this.parse(Init);
        const client = getElasticsearchClient();
        const health = await client.healthCheck();

        if (health.status === clusterStatus.YELLOW) {
            cli.warn('cluster status is yellow.');
        } else if (health.status === clusterStatus.RED) {
            cli.error('cluster status is red.');
            cli.exit(1);
        }
        cli.log('Start creating index for migrate.');

        const exists = await client.exists('migrate_history');
        if (exists) {
            cli.log('migrate_history index already exists.');
            cli.exit(1);
        }
        const mappingData = JSON.parse(
            fs.readFileSync(path.join(__dirname, '../../', 'mapping', 'migrate_history.json'), {
                encoding: 'utf-8'
            })
        ) as MappingData;
        const ret = await client
            .createIndex(MAPPING_HISTORY_INDEX_NAME, mappingData)
            .catch((reason) => {
                throw new Error(reason);
            });
        if (ret.statusCode === 200) {
            cli.log('Finish creating index for migrate.');
        } else {
            cli.error('Failed to create index for migrate.', { code: ret.statusCode });
            cli.error(ret.error);
        }
    }
}
