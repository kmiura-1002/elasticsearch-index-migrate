import ElasticsearchClient from '../../src/utils/es/ElasticsearchClient';
import { cli } from 'cli-ux';
import { ClusterStatuses, SimpleJson } from '../../src/model/types';

export default class MockElasticsearchClient implements ElasticsearchClient {
    close() {
        cli.debug('Called MockElasticsearchClient.close');
    }
    createIndex(index: string, body?: any) {
        cli.debug(
            `Called MockElasticsearchClient.createIndex: index=${index}, body=${JSON.stringify(
                body
            )}`
        );
        return Promise.resolve({ statusCode: 200 });
    }
    exists(index: string) {
        cli.debug(`Called MockElasticsearchClient.exists: index=${index}`);
        return Promise.resolve(false);
    }
    postDocument(index: string, body?: any, id?: string) {
        cli.debug(
            `Called MockElasticsearchClient.postDocument: index=${index}, body=${JSON.stringify(
                body
            )}, id=${id}`
        );
        return Promise.resolve({ statusCode: 200 });
    }
    putMapping(index: string, body: any) {
        cli.debug(
            `Called MockElasticsearchClient.putMapping: index=${index}, body=${JSON.stringify(
                body
            )}`
        );
        return Promise.resolve({ statusCode: 200 });
    }
    putSetting(index: string, body: any) {
        cli.debug(
            `Called MockElasticsearchClient.putSetting: index=${index}, body=${JSON.stringify(
                body
            )}`
        );
        return Promise.resolve({ statusCode: 200 });
    }
    search(index: string, query?: any) {
        cli.debug(
            `Called MockElasticsearchClient.search: index=${index}, query=${JSON.stringify(query)}`
        );
        return Promise.resolve([]);
    }
    version() {
        return 'mock-version';
    }

    healthCheck(): Promise<{ status: string }> {
        return Promise.resolve({ status: ClusterStatuses.GREEN });
    }

    delete(_index: string | string[]) {
        cli.debug(`Called MockElasticsearchClient.delete: index=${_index}`);
        return Promise.resolve({ statusCode: 200 });
    }

    getMapping(_index: string): Promise<SimpleJson> {
        return Promise.resolve({
            migrate_history: {
                mappings: {
                    properties: {
                        description: {
                            type: 'text'
                        },
                        execution_time: {
                            type: 'long'
                        },
                        index_name: {
                            type: 'keyword'
                        },
                        installed_on: {
                            type: 'date'
                        },
                        migrate_version: {
                            type: 'keyword'
                        },
                        script_name: {
                            type: 'keyword'
                        },
                        script_type: {
                            type: 'keyword'
                        },
                        success: {
                            type: 'boolean'
                        }
                    }
                }
            }
        });
    }
}
