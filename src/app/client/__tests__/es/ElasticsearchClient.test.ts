import useElasticsearchClient from '../../es/ElasticsearchClient';
import { ResponseError } from 'es7/lib/errors';

describe('Elasticsearch6', () => {
    const client = useElasticsearchClient({
        version: '6',
        searchEngine: 'elasticsearch',
        connect: {
            host: 'http://localhost:9201'
        }
    });

    it('can get version', () => {
        expect(client.version()).toEqual({
            engine: 'Elasticsearch',
            major: 6,
            minor: 0,
            patch: 0
        });
    });

    it('can call Exist api', async () => {
        const index = `test_index_${Math.random().toString(32).substring(2)}`;
        const exists = await client.exists({ index });
        expect(exists).toBeFalsy();
    });

    it('can call Create index api', async () => {
        const index = `test_index_${Math.random().toString(32).substring(2)}`;
        const create = await client.createIndex({ index });
        expect(create.statusCode).toEqual(200);
        await client.deleteIndex({ index });
    });

    it('can call search api', async () => {
        const index = `test_index_${Math.random().toString(32).substring(2)}`;
        await client.createIndex({ index });
        const ret = await client.search({ index });
        expect(ret).toEqual([]);
        await client.deleteIndex({ index });
    });

    it('can call mapping api', async () => {
        const index = `test_index_${Math.random().toString(32).substring(2)}`;
        await client.createIndex({ index });
        const ret = await client.putMapping({
            index,
            type: '_doc',
            body: {
                properties: {
                    test_id: {
                        type: 'long'
                    }
                }
            }
        });
        expect(ret.statusCode).toEqual(200);
        await client.deleteIndex({ index });
    });

    it('can not call mapping api when not exists type param', async () => {
        const index = `test_index_${Math.random().toString(32).substring(2)}`;
        await client.createIndex({ index });
        const ret = await client.putMapping({
            index,
            body: {
                properties: {
                    test_id: {
                        type: 'long'
                    }
                }
            }
        });
        expect(ret.statusCode).toEqual(200);
        await client.deleteIndex({ index });
    });

    it('can call settings api', async () => {
        const index = `test_index_${Math.random().toString(32).substring(2)}`;
        await client.createIndex({ index });
        const ret = await client.putSetting({
            index,
            body: {
                index: {
                    number_of_replicas: 0
                }
            }
        });
        expect(ret.statusCode).toEqual(200);
        await client.deleteIndex({ index });
    });

    it('can call document api', async () => {
        const index = `test_index_${Math.random().toString(32).substring(2)}`;
        await client.createIndex({ index });
        const ret = await client.postDocument({
            index,
            body: {
                test: 'foo baz'
            }
        });

        expect(ret.statusCode).toEqual(201);
        await client.deleteIndex({ index });
    });

    it('can call get mapping api', async () => {
        const index = `test_index_${Math.random().toString(32).substring(2)}`;
        await client.createIndex({
            index,
            body: {
                mappings: {
                    test: {
                        properties: {
                            test_name: {
                                type: 'keyword'
                            }
                        }
                    }
                }
            }
        });
        const ret = await client.getMapping({ index });
        expect(ret).toHaveLength(1);
        expect(ret[0]).toEqual({
            mappings: {
                test: {
                    properties: {
                        test_name: {
                            type: 'keyword'
                        }
                    }
                }
            }
        });
        await client.deleteIndex({ index });
    });

    it('can get exclude type name mapping when query params is include_type_name=false', async () => {
        const index = `test_index_${Math.random().toString(32).substring(2)}`;
        await client.createIndex({
            index,
            body: {
                mappings: {
                    my_type: {
                        properties: {
                            test_name: {
                                type: 'keyword'
                            }
                        }
                    }
                }
            }
        });
        const ret = await client.getMapping({ index, include_type_name: false });
        expect(ret).toHaveLength(1);
        expect(ret[0]).toEqual({
            mappings: {
                properties: {
                    test_name: {
                        type: 'keyword'
                    }
                }
            }
        });
        await client.deleteIndex({ index });
    });

    it('can get index data', async () => {
        const index = `test_index_${Math.random().toString(32).substring(2)}`;
        await client.createIndex({
            index,
            body: {
                settings: {
                    index: {
                        refresh_interval: '1s',
                        number_of_shards: 1,
                        number_of_replicas: 0
                    }
                },
                mappings: {
                    test: {
                        properties: {
                            test_name: {
                                type: 'keyword'
                            }
                        }
                    }
                }
            }
        });
        const ret = await client.getIndex({ index });

        expect((ret as any)[index].mappings).toEqual({
            test: {
                properties: {
                    test_name: {
                        type: 'keyword'
                    }
                }
            }
        });
        expect((ret as any)[index].aliases).toEqual({});
        expect((ret as any)[index].settings.index.refresh_interval).toEqual('1s');
        expect((ret as any)[index].settings.index.number_of_shards).toEqual('1');
        expect((ret as any)[index].settings.index.number_of_replicas).toEqual('0');
        await client.deleteIndex({ index });
    });

    it('can call delete document api', async () => {
        const index = `test_index_${Math.random().toString(32).substring(2)}`;
        await client.createIndex({
            index,
            body: {
                mappings: {
                    _doc: {
                        properties: {
                            test: {
                                type: 'keyword'
                            }
                        }
                    }
                }
            }
        });
        await client
            .postDocument({
                index,
                type: '_doc',
                body: {
                    test: 'foobaz'
                },
                refresh: 'true'
            })
            .then((value) => expect(value.statusCode).toEqual(201));

        await client.search({ index }).then((value) => {
            expect(value[0]).toEqual({
                test: 'foobaz'
            });
        });

        await client
            .deleteDocument({
                index,
                refresh: true,
                body: {
                    query: {
                        term: {
                            test: {
                                value: 'foobaz'
                            }
                        }
                    }
                }
            })
            .then((value) => expect(value.statusCode).toEqual(200));

        await client.search({ index }).then((value) => {
            expect(value).toHaveLength(0);
        });

        await client.deleteIndex({ index });
    });

    it('can call Exist api when args is es7 params', async () => {
        const index = `test_index_${Math.random().toString(32).substring(2)}`;
        await expect(client.exists({ index, expand_wildcards: 'hidden' })).rejects.toThrowError();
    });

    it('can not call search api when args is es7 params ccs_minimize_roundtrips', async () => {
        const index = `test_index_${Math.random().toString(32).substring(2)}`;
        await client.createIndex({ index });
        await expect(
            client.search({ index, ccs_minimize_roundtrips: false })
        ).rejects.toThrowError();
        await client.deleteIndex({ index });
    });

    it('can not call search api when args is es7 params expand_wildcards', async () => {
        const index = `test_index_${Math.random().toString(32).substring(2)}`;
        await client.createIndex({ index });
        await expect(client.search({ index, expand_wildcards: 'hidden' })).rejects.toThrowError();
        await client.deleteIndex({ index });
    });

    it('can not call mapping api when args is es7 params', async () => {
        const index = `test_index_${Math.random().toString(32).substring(2)}`;
        await client.createIndex({ index });
        await expect(
            client.putMapping({
                index,
                expand_wildcards: 'hidden',
                body: {
                    properties: {
                        test_id: {
                            type: 'long'
                        }
                    }
                }
            })
        ).rejects.toThrowError();
        await client.deleteIndex({ index });
    });

    it('can not call settings api when args is es7 params', async () => {
        const index = `test_index_${Math.random().toString(32).substring(2)}`;
        await client.createIndex({ index });
        await expect(
            client.putSetting({
                index,
                expand_wildcards: 'hidden',
                body: {
                    index: {
                        number_of_replicas: 0
                    }
                }
            })
        ).rejects.toThrowError();
        await client.deleteIndex({ index });
    });

    it('can not get mapping when args is es7 params', async () => {
        const index = `test_index_${Math.random().toString(32).substring(2)}`;
        await client.createIndex({
            index,
            body: {
                mappings: {
                    test: {
                        properties: {
                            test_name: {
                                type: 'keyword'
                            }
                        }
                    }
                }
            }
        });
        await expect(
            client.getMapping({ index, expand_wildcards: 'hidden' })
        ).rejects.toThrowError();
        await client.deleteIndex({ index });
    });

    it('can not get index data when args is es7 params', async () => {
        const index = `test_index_${Math.random().toString(32).substring(2)}`;
        await client.createIndex({
            index,
            body: {
                settings: {
                    index: {
                        refresh_interval: '1s',
                        number_of_shards: 1,
                        number_of_replicas: 0
                    }
                },
                mappings: {
                    test: {
                        properties: {
                            test_name: {
                                type: 'keyword'
                            }
                        }
                    }
                }
            }
        });
        expect(client.getIndex({ index, expand_wildcards: 'hidden' })).rejects.toThrowError();
        await client.deleteIndex({ index });
    });

    it('can not delete document when args is es7 params', async () => {
        const index = `test_index_${Math.random().toString(32).substring(2)}`;
        await client.createIndex({
            index,
            body: {
                mappings: {
                    _doc: {
                        properties: {
                            test: {
                                type: 'keyword'
                            }
                        }
                    }
                }
            }
        });
        await client
            .postDocument({
                index,
                type: '_doc',
                body: {
                    test: 'foobaz'
                },
                refresh: 'true'
            })
            .then((value) => expect(value.statusCode).toEqual(201));

        await client.search({ index }).then((value) => {
            // expect(value).to.be.an('array');
            expect(value[0]).toEqual({
                test: 'foobaz'
            });
        });

        await expect(
            client.deleteDocument({
                index,
                max_docs: 1,
                body: {
                    query: {
                        term: {
                            test: {
                                value: 'foobaz'
                            }
                        }
                    }
                }
            })
        ).rejects.toThrowError();
        await expect(
            client.deleteDocument({
                index,
                expand_wildcards: 'hidden',
                body: {
                    query: {
                        term: {
                            test: {
                                value: 'foobaz'
                            }
                        }
                    }
                }
            })
        ).rejects.toThrowError();

        await client.deleteIndex({ index });
    });

    it('can not delete index when args is es7 params', async () => {
        const index = `test_index_${Math.random().toString(32).substring(2)}`;
        await client.createIndex({ index });
        await expect(
            client.deleteIndex({ index, expand_wildcards: 'hidden' })
        ).rejects.toThrowError();
        await client.deleteIndex({ index });
    });

    it('can call health check api', async () => {
        await expect(client.healthCheck()).resolves.toEqual({
            status: 'green'
        });
    });

    it('can call close client', async () => {
        await client.close();
        await expect(client.healthCheck()).rejects.toThrowError();
    });
});

describe('Elasticsearch7', () => {
    const client = useElasticsearchClient({
        version: '7',
        searchEngine: 'elasticsearch',
        connect: {
            host: 'http://localhost:9202'
        }
    });

    it('can get version', () => {
        expect(client.version()).toEqual({
            engine: 'Elasticsearch',
            major: 7,
            minor: 0,
            patch: 0
        });
    });

    it('can call Exist api', async () => {
        const index = `test_index_${Math.random().toString(32).substring(2)}`;
        const exists = await client.exists({ index });
        expect(exists).toBeFalsy();
    });

    it('can call Create index api', async () => {
        const index = `test_index_${Math.random().toString(32).substring(2)}`;
        const create = await client.createIndex({ index });
        expect(create.statusCode).toEqual(200);
        await client.deleteIndex({ index });
    });

    it('can call search api', async () => {
        const index = `test_index_${Math.random().toString(32).substring(2)}`;
        await client.createIndex({ index });
        const ret = await client.search({ index });
        expect(ret).toEqual([]);
        await client.deleteIndex({ index });
    });

    it('can call mapping api', async () => {
        const index = `test_index_${Math.random().toString(32).substring(2)}`;
        await client.createIndex({ index });
        const ret = await client.putMapping({
            index,
            body: {
                properties: {
                    test_id: {
                        type: 'long'
                    }
                }
            }
        });
        expect(ret.statusCode).toEqual(200);
        await client.deleteIndex({ index });
    });

    it('can call settings api', async () => {
        const index = `test_index_${Math.random().toString(32).substring(2)}`;
        await client.createIndex({ index });
        const ret = await client.putSetting({
            index,
            body: {
                index: {
                    number_of_replicas: 0
                }
            }
        });
        expect(ret.statusCode).toEqual(200);
        await client.deleteIndex({ index });
    });

    it('can call document api', async () => {
        const index = `test_index_${Math.random().toString(32).substring(2)}`;
        await client.createIndex({ index });
        const ret = await client.postDocument({
            index,
            body: {
                test: 'foo baz'
            }
        });

        expect(ret.statusCode).toEqual(201);
        await client.deleteIndex({ index });
    });

    it('can call document api when custom index type is set', async () => {
        const index = `test_index_${Math.random().toString(32).substring(2)}`;
        await client.createIndex({ index });
        const ret = await client.postDocument({
            index,
            type: 'test',
            body: {
                test: 'foo baz'
            }
        });

        expect(ret.statusCode).toEqual(201);
        await client.deleteIndex({ index });
    });

    it('can not call document api when args is es6 params', async () => {
        const index = `test_index_${Math.random().toString(32).substring(2)}`;
        await client.createIndex({ index });

        await expect(
            client.postDocument({
                index,
                type: '_doc',
                parent: '',
                body: {
                    test: 'foo baz'
                }
            })
        ).rejects.toThrowError(ResponseError);
        await client.deleteIndex({ index });
    });

    it('can call get mapping api', async () => {
        const index = `test_index_${Math.random().toString(32).substring(2)}`;
        await client.createIndex({
            index,
            body: {
                mappings: {
                    properties: {
                        test_name: {
                            type: 'keyword'
                        }
                    }
                }
            }
        });
        const ret = await client.getMapping({ index });
        expect(ret).toHaveLength(1);
        expect(ret[0]).toEqual({
            mappings: {
                properties: {
                    test_name: {
                        type: 'keyword'
                    }
                }
            }
        });
        await client.deleteIndex({ index });
    });

    it('can get exclude type name mapping when query params is include_type_name=false', async () => {
        const index = `test_index_${Math.random().toString(32).substring(2)}`;
        await client.createIndex({
            index,
            include_type_name: true,
            body: {
                mappings: {
                    my_type: {
                        properties: {
                            test_name: {
                                type: 'keyword'
                            }
                        }
                    }
                }
            }
        });
        const ret = await client.getMapping({ index, include_type_name: false });
        expect(ret).toHaveLength(1);
        expect(ret[0]).toEqual({
            mappings: {
                properties: {
                    test_name: {
                        type: 'keyword'
                    }
                }
            }
        });
        await client.deleteIndex({ index });
    });

    it('can get index data', async () => {
        const index = `test_index_${Math.random().toString(32).substring(2)}`;
        await client.createIndex({
            index,
            body: {
                settings: {
                    index: {
                        refresh_interval: '1s',
                        number_of_shards: 1,
                        number_of_replicas: 0
                    }
                },
                mappings: {
                    properties: {
                        test_name: {
                            type: 'keyword'
                        }
                    }
                }
            }
        });
        const ret = await client.getIndex({ index });

        expect((ret as any)[index].mappings).toEqual({
            properties: {
                test_name: {
                    type: 'keyword'
                }
            }
        });
        expect((ret as any)[index].aliases).toEqual({});
        expect((ret as any)[index].settings.index.refresh_interval).toEqual('1s');
        expect((ret as any)[index].settings.index.number_of_shards).toEqual('1');
        expect((ret as any)[index].settings.index.number_of_replicas).toEqual('0');
        await client.deleteIndex({ index });
    });

    it('can call delete document api', async () => {
        const index = `test_index_${Math.random().toString(32).substring(2)}`;
        await client.createIndex({
            index,
            body: {
                mappings: {
                    properties: {
                        test: {
                            type: 'keyword'
                        }
                    }
                }
            }
        });
        await client
            .postDocument({
                index,
                body: {
                    test: 'foobaz'
                },
                refresh: true
            })
            .then((value) => expect(value.statusCode).toEqual(201));

        await client.search({ index }).then((value) => {
            expect(value[0]).toEqual({
                test: 'foobaz'
            });
        });

        await client
            .deleteDocument({
                index,
                refresh: true,
                body: {
                    query: {
                        term: {
                            test: {
                                value: 'foobaz'
                            }
                        }
                    }
                }
            })
            .then((value) => expect(value.statusCode).toEqual(200));

        await client.search({ index }).then((value) => {
            expect(value.length).toEqual(0);
        });

        await client.deleteIndex({ index });
    });

    it('can call health check api', async () => {
        await expect(client.healthCheck()).resolves.toEqual({
            status: 'green'
        });
    });

    it('can call close client', async () => {
        await client.close();
        await expect(client.healthCheck()).rejects.toThrowError();
    });
});
