import ElasticsearchClient from '../../utils/es/ElasticsearchClient';
import { CLEAN_TARGET, MAPPING_HISTORY_INDEX_NAME } from '../../model/types';

export function cleanExecutor(
    esClient: ElasticsearchClient,
    indexName: string,
    target: CLEAN_TARGET
) {
    switch (target) {
        case 'history':
            return esClient.deleteDocument(MAPPING_HISTORY_INDEX_NAME, {
                query: {
                    term: {
                        index_name: {
                            value: indexName
                        }
                    }
                }
            });
        case 'index':
        case 'all':
            // TODO 後で実装する
            return Promise.reject('Not implemented. Aborting the process.');
    }
}
