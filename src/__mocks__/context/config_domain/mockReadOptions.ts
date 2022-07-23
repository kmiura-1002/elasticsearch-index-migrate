import { ToolConfigSpecProps } from '../../../app/context/config_domain/spec';
import { ToolConfigEntity } from '../../../app/context/config_domain/toolConfigEntity';

export const mockToolConfigRepository = jest.fn().mockImplementation(() => mockRepository());

function mockRepository() {
    const findBy = jest
        .fn()
        .mockImplementation(
            (_spec: ToolConfigSpecProps): Promise<ToolConfigEntity> =>
                Promise.resolve(ToolConfigEntity.readConfig(mockReadOptions))
        );

    return {
        findBy
    };
}

export const mockReadOptions = {
    elasticsearch: {
        connect: {
            host: 'http://localhost:9202'
        },
        searchEngine: 'elasticsearch',
        version: '7.7.0'
    },
    migration: {
        location: '',
        baselineVersions: {
            test_index: '1.0.0'
        }
    }
};

export const mockReadOptionsWithHistoryIndexRequestBody = {
    elasticsearch: {
        connect: {
            host: 'http://localhost:9202'
        },
        searchEngine: 'elasticsearch',
        version: '7.7.0'
    },
    migration: {
        location: '',
        baselineVersions: {
            test_index: '1.0.0'
        },
        historyIndexRequestBody: {
            settings: {
                index: {
                    refresh_interval: '1s',
                    number_of_shards: 1,
                    number_of_replicas: 2,
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
        }
    }
};
