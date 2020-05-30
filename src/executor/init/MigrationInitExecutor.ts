import ElasticsearchClient from '../../utils/es/ElasticsearchClient';
import { MAPPING_HISTORY_INDEX_NAME } from '../../model/types';
import { cli } from 'cli-ux';
import * as v7Mapping from '../../resources/mapping/migrate_history_esV7.json';
import * as v6Mapping from '../../resources/mapping/migrate_history_esV6.json';

export async function createHistoryIndex(esClient: ElasticsearchClient, esVersion: string) {
    const mappingData = esVersion === '7' ? v7Mapping : v6Mapping;
    const ret = await esClient
        .createIndex(MAPPING_HISTORY_INDEX_NAME, mappingData)
        .catch((reason) => {
            cli.error(`Failed to create index: ${JSON.stringify(reason)}`, { exit: 1 });
            cli.exit(1);
        });
    if (!ret || ret.statusCode !== 200) {
        cli.error('Failed to create index for migrate.', { exit: 1 });
        cli.exit(1);
    }
}
