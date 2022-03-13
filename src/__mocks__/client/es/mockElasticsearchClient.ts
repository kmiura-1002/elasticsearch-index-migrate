import { ClusterStatuses } from '../../../app/types';
import type { ESConfig, SearchEngineVersion, SimpleJson } from '../../../app/types';
import type {
    ClusterHealth as ClusterHealth6,
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
import type {
    ClusterHealth as ClusterHealth7,
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
import type { ApiResponse as ApiResponse6 } from 'es6/lib/Transport';
import type { ApiResponse as ApiResponse7 } from 'es7/lib/Transport';

export const getMockElasticsearchClient = jest.fn().mockImplementation(() =>
    useElasticsearchClient({
        version: '7',
        searchEngine: 'elasticsearch',
        connect: {}
    })
);

export function useElasticsearchClient(_connectConf: ESConfig) {
    const healthCheck = jest
        .fn()
        .mockImplementation(
            (_request?: ClusterHealth6 | ClusterHealth7): Promise<{ status: string }> =>
                Promise.resolve({ status: ClusterStatuses.GREEN })
        );

    const putMapping = jest
        .fn()
        .mockImplementation(
            (
                _request: IndicesPutMapping6 | IndicesPutMapping7
            ): Promise<ApiResponse6<any, any> | ApiResponse7<any, any>> => {
                return Promise.resolve({ statusCode: 200 } as ApiResponse6 | ApiResponse7);
            }
        );

    const createIndex = jest
        .fn()
        .mockImplementation(
            (
                _request: IndicesCreate6 | IndicesCreate7
            ): Promise<ApiResponse6<any, any> | ApiResponse7<any, any>> => {
                return Promise.resolve({ statusCode: 200 } as ApiResponse6 | ApiResponse7);
            }
        );

    const search = jest.fn().mockImplementation(<R>(_param: Search6 | Search7): Promise<R[]> => {
        return Promise.resolve([]);
    });

    const exists = jest
        .fn()
        .mockImplementation((_param: IndicesExists6 | IndicesExists7): Promise<boolean> => {
            return Promise.resolve(false);
        });

    const version = jest.fn().mockImplementation(
        (): SearchEngineVersion => ({
            engine: 'Elasticsearch',
            major: 7,
            minor: 7,
            patch: 0
        })
    );

    const putSetting = jest
        .fn()
        .mockImplementation(
            (
                _param: IndicesPutSettings6 | IndicesPutSettings7
            ): Promise<ApiResponse6<any, any> | ApiResponse7<any, any>> => {
                return Promise.resolve({ statusCode: 200 } as ApiResponse6 | ApiResponse7);
            }
        );

    const deleteIndex = jest
        .fn()
        .mockImplementation(
            (
                _param: IndicesDelete6 | IndicesDelete7
            ): Promise<ApiResponse6<any, any> | ApiResponse7<any, any>> => {
                return Promise.resolve({ statusCode: 200 } as ApiResponse6 | ApiResponse7);
            }
        );

    const postDocument = jest
        .fn()
        .mockImplementation(
            (_param: Index6 | Index7): Promise<ApiResponse6<any, any> | ApiResponse7<any, any>> => {
                return Promise.resolve({
                    body: {
                        _index: 'test',
                        _type: '_doc',
                        _id: '7SMGOn8B-6SrJCEhwncT',
                        _version: 1,
                        result: 'created',
                        _shards: {
                            total: 1,
                            successful: 1,
                            failed: 0
                        },
                        _seq_no: 0,
                        _primary_term: 1
                    },
                    statusCode: 201
                } as ApiResponse6 | ApiResponse7);
            }
        );

    const close = jest.fn().mockImplementation((): Promise<void> => Promise.resolve());

    const getMapping = jest.fn().mockImplementation(
        (_param: IndicesGetMapping6 | IndicesGetMapping7): Promise<Array<SimpleJson>> =>
            Promise.resolve([
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
            ])
    );

    const getIndex = jest.fn().mockImplementation(
        (_param: IndicesGet6 | IndicesGet7): Promise<SimpleJson> =>
            Promise.resolve({
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
            })
    );

    const deleteDocument = jest
        .fn()
        .mockImplementation(
            (_param: DeleteByQuery6 | DeleteByQuery7): Promise<any> => Promise.resolve()
        );

    return {
        healthCheck,
        putMapping,
        createIndex,
        search,
        exists,
        version,
        putSetting,
        deleteIndex,
        postDocument,
        close,
        getMapping,
        getIndex,
        deleteDocument
    };
}
