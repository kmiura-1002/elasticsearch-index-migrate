import OldElasticsearchClient from '../../app/client/es/ElasticsearchClient';
import { cli } from 'cli-ux';
import {
    DeleteByQuery as DeleteByQuery6,
    Index as Index6,
    IndicesCreate as IndicesCreate6,
    IndicesDelete as IndicesDelete6,
    IndicesExists as IndicesExists6,
    IndicesGet as IndicesGet6,
    IndicesGetMapping as IndicesGetMapping6,
    IndicesPutMapping as IndicesPutMapping6,
    IndicesPutSettings as IndicesPutSettings6,
    Search as Search6
} from 'es6/api/requestParams';
import {
    DeleteByQuery as DeleteByQuery7,
    Index as Index7,
    IndicesCreate as IndicesCreate7,
    IndicesDelete as IndicesDelete7,
    IndicesExists as IndicesExists7,
    IndicesGet as IndicesGet7,
    IndicesGetMapping as IndicesGetMapping7,
    IndicesPutMapping as IndicesPutMapping7,
    IndicesPutSettings as IndicesPutSettings7,
    Search as Search7
} from 'es7/api/requestParams';
import { ApiResponse as ApiResponse6 } from 'es6/lib/Transport';
import { ApiResponse as ApiResponse7 } from 'es7/lib/Transport';
import { ClusterStatuses, ELASTICSEARCH_VERSION, SimpleJson } from '../../app/types';

export const getMockElasticsearchClient = jest.fn().mockImplementation(() => {
    return new MockElasticsearchClient();
});

class MockElasticsearchClient implements OldElasticsearchClient {
    close() {
        cli.debug('Called MockElasticsearchClient.close');
    }
    createIndex(param: IndicesCreate6 | IndicesCreate7) {
        cli.debug(`Called MockElasticsearchClient.createIndex: param=${JSON.stringify(param)}`);
        return Promise.resolve({ statusCode: 200 } as ApiResponse6 | ApiResponse7);
    }
    exists(param: IndicesExists6 | IndicesExists7) {
        cli.debug(`Called MockElasticsearchClient.exists: index=${param.index}`);
        return Promise.resolve(false);
    }
    postDocument(param: Index6 | Index7) {
        cli.debug(`Called MockElasticsearchClient.postDocument: param=${JSON.stringify(param)}`);
        return Promise.resolve({ statusCode: 200 } as ApiResponse6 | ApiResponse7);
    }
    putMapping(param: IndicesPutMapping6 | IndicesPutMapping7) {
        cli.debug(`Called MockElasticsearchClient.putMapping: param=${JSON.stringify(param)}`);
        return Promise.resolve({ statusCode: 200 } as ApiResponse6 | ApiResponse7);
    }
    putSetting(param: IndicesPutSettings6 | IndicesPutSettings7) {
        cli.debug(`Called MockElasticsearchClient.putSetting: param=${JSON.stringify(param)}`);
        return Promise.resolve({ statusCode: 200 } as ApiResponse6 | ApiResponse7);
    }
    search(param: Search6 | Search7): Promise<any[]> {
        cli.debug(`Called MockElasticsearchClient.search: param=${JSON.stringify(param)}`);
        return Promise.resolve([]);
    }

    version(): ELASTICSEARCH_VERSION {
        return '7.x';
    }

    healthCheck(): Promise<{ status: string }> {
        return Promise.resolve({ status: ClusterStatuses.GREEN });
    }

    delete(param: IndicesDelete6 | IndicesDelete7) {
        cli.debug(`Called MockElasticsearchClient.delete: param=${JSON.stringify(param)}`);
        return Promise.resolve({ statusCode: 200 } as ApiResponse6 | ApiResponse7);
    }

    getMapping(_param: IndicesGetMapping6 | IndicesGetMapping7): Promise<Array<SimpleJson>> {
        return Promise.resolve([
            {
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
            }
        ]);
    }

    get(_param: IndicesGet6 | IndicesGet7): Promise<SimpleJson> {
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

    deleteDocument(_param: DeleteByQuery6 | DeleteByQuery7): Promise<any> {
        return Promise.resolve();
    }
}
