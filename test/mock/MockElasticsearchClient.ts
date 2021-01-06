import ElasticsearchClient from '../../src/utils/es/ElasticsearchClient';
import { cli } from 'cli-ux';
import { ClusterStatuses, SimpleJson } from '../../src/model/types';
import {
    IndicesCreate as IndicesCreate6,
    IndicesExists as IndicesExists6
} from 'es6/api/requestParams';
import {
    IndicesCreate as IndicesCreate7,
    IndicesExists as IndicesExists7,
    IndicesPutMapping as IndicesPutMapping7
} from 'es7/api/requestParams';

export default class MockElasticsearchClient implements ElasticsearchClient {
    close() {
        cli.debug('Called MockElasticsearchClient.close');
    }
    createIndex(param: IndicesCreate6 | IndicesCreate7) {
        cli.debug(`Called MockElasticsearchClient.createIndex: param=${JSON.stringify(param)}`);
        return Promise.resolve({ statusCode: 200 });
    }
    exists(param: IndicesExists6 | IndicesExists7) {
        cli.debug(`Called MockElasticsearchClient.exists: index=${param.index}`);
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
    putMapping(param: IndicesPutMapping7) {
        cli.debug(`Called MockElasticsearchClient.putMapping: param=${JSON.stringify(param)}`);
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
    search(index: string, query?: any): Promise<any[]> {
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

    get(_index: string): Promise<SimpleJson> {
        return Promise.resolve({
            settings: {
                index: {
                    refresh_interval: '1s',
                    number_of_shards: 1,
                    number_of_replicas: 0,
                    search: {
                        slowlog: {
                            threshold: {
                                query: {
                                    trace: '100ms',
                                    debug: '100ms',
                                    info: '100ms',
                                    warn: '1000ms'
                                },
                                fetch: {
                                    trace: '100ms',
                                    debug: '100ms',
                                    info: '100ms',
                                    warn: '1000ms'
                                }
                            },
                            level: 'info'
                        }
                    },
                    indexing: {
                        slowlog: {
                            threshold: {
                                index: {
                                    trace: '100ms',
                                    debug: '100ms',
                                    info: '100ms',
                                    warn: '1000ms'
                                }
                            },
                            level: 'info'
                        }
                    }
                }
            },
            mappings: {
                properties: {
                    index_name: {
                        type: 'keyword'
                    },
                    migrate_version: {
                        type: 'keyword'
                    },
                    description: {
                        type: 'text'
                    },
                    script_name: {
                        type: 'keyword'
                    },
                    script_type: {
                        type: 'keyword'
                    },
                    installed_on: {
                        type: 'date'
                    },
                    execution_time: {
                        type: 'long'
                    },
                    success: {
                        type: 'boolean'
                    }
                }
            }
        });
    }

    deleteDocument(_indexName: string, _body: any): Promise<any> {
        return Promise.resolve();
    }
}
