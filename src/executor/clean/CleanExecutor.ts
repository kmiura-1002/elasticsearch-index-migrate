import ElasticsearchClient from '../../utils/es/ElasticsearchClient';
import { CLEAN_TARGET, MAPPING_HISTORY_INDEX_NAME } from '../../model/types';
import { cli } from 'cli-ux';

export async function cleanExecutor(
    esClient: ElasticsearchClient,
    indexName: string,
    target: CLEAN_TARGET
) {
    switch (target) {
        case 'history':
            await esClient
                .deleteDocument(MAPPING_HISTORY_INDEX_NAME, {
                    query: {
                        term: {
                            index_name: {
                                value: indexName
                            }
                        }
                    }
                })
                .catch((reason) => {
                    cli.error(
                        `An error occurred during the deletion process : ${JSON.stringify(reason)}`
                    );
                });
            break;
        case 'index':
            await esClient.delete(indexName).catch((reason) => {
                cli.error(
                    `An error occurred during the deletion process : ${JSON.stringify(reason)}`
                );
            });
            break;
        case 'all':
            // TODO 後で実装する
            cli.error('Not implemented. Aborting the process.');
    }
}
