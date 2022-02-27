import ElasticsearchClient from '../../utils/es/ElasticsearchClient';
import {
    MappingHistoryIndex,
    MAPPING_HISTORY_INDEX_NAME,
    SearchEngineVersion
} from '../../model/types';
import { cli } from 'cli-ux';
import v7Mapping from '../../resources/mapping/migrate_history_esV7.json';
import v6Mapping from '../../resources/mapping/migrate_history_esV6.json';

export async function createHistoryIndex(
    esClient: ElasticsearchClient,
    esVersion?: SearchEngineVersion,
    numShards?: number,
    numReplica?: number
): Promise<void> {
    const mappingData: MappingHistoryIndex = mapping(esVersion);
    if (typeof numShards !== 'undefined') {
        mappingData.settings.index.number_of_shards = numShards;
    }
    if (typeof numReplica !== 'undefined') {
        mappingData.settings.index.number_of_replicas = numReplica;
    }
    const ret = await esClient
        .createIndex({ index: MAPPING_HISTORY_INDEX_NAME, body: mappingData })
        .catch((reason) => {
            cli.error(`Failed to create index: ${JSON.stringify(reason)}`, { exit: 1 });
            cli.exit(1);
        });
    if (!ret || ret.statusCode !== 200) {
        cli.error('Failed to create index for migrate.', { exit: 1 });
        cli.exit(1);
    }
}

const mapping = (esVersion?: SearchEngineVersion) => {
    if (esVersion?.engine === 'OpenSearch') {
        return v7Mapping;
    } else {
        return esVersion?.major === 7 ? v7Mapping : v6Mapping;
    }
};
