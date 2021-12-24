import ElasticsearchClient from '../../src/client/es/ElasticsearchClient';
import { cli } from 'cli-ux';
import { ClusterStatuses, SimpleJson } from '../../src/model/types';
import {
    IndicesCreate as IndicesCreate6,
    IndicesExists as IndicesExists6,
    IndicesPutMapping as IndicesPutMapping6,
    IndicesPutSettings as IndicesPutSettings6,
    IndicesDelete as IndicesDelete6,
    IndicesGetMapping as IndicesGetMapping6,
    IndicesGet as IndicesGet6,
    Search as Search6,
    Index as Index6,
    DeleteByQuery as DeleteByQuery6
} from 'es6/api/requestParams';
import {
    IndicesCreate as IndicesCreate7,
    IndicesExists as IndicesExists7,
    IndicesPutMapping as IndicesPutMapping7,
    IndicesPutSettings as IndicesPutSettings7,
    IndicesDelete as IndicesDelete7,
    IndicesGetMapping as IndicesGetMapping7,
    IndicesGet as IndicesGet7,
    Search as Search7,
    Index as Index7,
    DeleteByQuery as DeleteByQuery7
} from 'es7/api/requestParams';
import { ApiResponse as ApiResponse6 } from 'es6';
import { ApiResponse as ApiResponse7 } from 'es7';

export default class MockElasticsearchClient implements ElasticsearchClient {
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
    version() {
        return 'mock-version';
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
