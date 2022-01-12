import {
    DeleteByQuery,
    Index,
    IndicesDelete,
    IndicesExists,
    IndicesGet,
    IndicesGetMapping,
    IndicesPutMapping,
    IndicesPutSettings,
    Search
} from 'es7/api/requestParams';
import { es6ClientContainer } from '../../../../../__mocks__/ioc-test';
import OldElasticsearchClient from '../../../es/ElasticsearchClient';
import { Bindings } from '../../../../ioc.bindings';

describe('Elasticsearch6Client', () => {
    const client = es6ClientContainer().get<OldElasticsearchClient>(Bindings.ElasticsearchClient);

    it('can get version', () => {
        expect(client.version()).toEqual('6.x');
    });

    it('can call Exist api', async () => {
        const index = `test_index_${Math.random().toString(32).substring(2)}`;
        const exists = await client.exists({ index });
        expect(exists).toBeFalsy();
    });

    it('can call Exist api when args is es7 params', async () => {
        const index = `test_index_${Math.random().toString(32).substring(2)}`;
        const param: IndicesExists = { index, expand_wildcards: 'hidden' };
        await expect(client.exists(param)).rejects.toEqual(
            `illegal argument : ${JSON.stringify(param)}`
        );
    });

    it('can call Create index api', async () => {
        const index = `test_index_${Math.random().toString(32).substring(2)}`;
        const create = await client.createIndex({ index });
        expect(create.statusCode).toEqual(200);
        await client.delete({ index });
    });

    it('can call search api', async () => {
        const index = `test_index_${Math.random().toString(32).substring(2)}`;
        await client.createIndex({ index });
        const ret = await client.search({ index });
        expect(ret).toEqual([]);
        await client.delete({ index });
    });

    it('can not call search api when args is es7 params ccs_minimize_roundtrips', async () => {
        const index = `test_index_${Math.random().toString(32).substring(2)}`;
        await client.createIndex({ index });
        const param: Search = { index, ccs_minimize_roundtrips: false };
        await expect(client.search(param)).rejects.toEqual(
            `illegal argument : ${JSON.stringify(param)}`
        );
        await client.delete({ index });
    });

    it('can not call search api when args is es7 params expand_wildcards', async () => {
        const index = `test_index_${Math.random().toString(32).substring(2)}`;
        await client.createIndex({ index });
        const param: Search = { index, expand_wildcards: 'hidden' };
        await expect(client.search(param)).rejects.toEqual(
            `illegal argument : ${JSON.stringify(param)}`
        );
        await client.delete({ index });
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
        await client.delete({ index });
    });

    it('can not call mapping api when args is es7 params', async () => {
        const index = `test_index_${Math.random().toString(32).substring(2)}`;
        await client.createIndex({ index });
        const param: IndicesPutMapping = {
            index,
            expand_wildcards: 'hidden',
            body: {
                properties: {
                    test_id: {
                        type: 'long'
                    }
                }
            }
        };
        await expect(client.putMapping(param)).rejects.toEqual(
            `illegal argument : ${JSON.stringify(param)}`
        );
        await client.delete({ index });
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
        await client.delete({ index });
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
        await client.delete({ index });
    });

    it('can not call settings api when args is es7 params', async () => {
        const index = `test_index_${Math.random().toString(32).substring(2)}`;
        await client.createIndex({ index });
        const param: IndicesPutSettings = {
            index,
            expand_wildcards: 'hidden',
            body: {
                index: {
                    number_of_replicas: 0
                }
            }
        };
        await expect(client.putSetting(param)).rejects.toEqual(
            `illegal argument : ${JSON.stringify(param)}`
        );
        await client.delete({ index });
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
        await client.delete({ index });
    });

    it('can not call document api when args is es7 params', async () => {
        const index = `test_index_${Math.random().toString(32).substring(2)}`;
        await client.createIndex({ index });
        const param: Index = {
            index,
            refresh: true,
            body: {
                test: 'foo baz'
            }
        };

        await expect(client.postDocument(param)).rejects.toEqual(
            `illegal argument : ${JSON.stringify(param)}`
        );
        await client.delete({ index });
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
        await client.delete({ index });
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
        await client.delete({ index });
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
        const param: IndicesGetMapping = { index, expand_wildcards: 'hidden' };
        await expect(client.getMapping(param)).rejects.toEqual(
            `illegal argument : ${JSON.stringify(param)}`
        );
        await client.delete({ index });
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
        const ret = await client.get({ index });

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
        await client.delete({ index });
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
        const param: IndicesGet = { index, expand_wildcards: 'hidden' };
        expect(client.get(param)).rejects.toEqual(`illegal argument : ${JSON.stringify(param)}`);
        await client.delete({ index });
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

        await client.delete({ index });
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

        const param1: DeleteByQuery = {
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
        };
        await expect(client.deleteDocument(param1)).rejects.toEqual(
            `illegal argument : ${JSON.stringify(param1)}`
        );
        const param2: DeleteByQuery = {
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
        };
        await expect(client.deleteDocument(param2)).rejects.toEqual(
            `illegal argument : ${JSON.stringify(param2)}`
        );

        await client.delete({ index });
    });

    it('can not delete index when args is es7 params', async () => {
        const index = `test_index_${Math.random().toString(32).substring(2)}`;
        await client.createIndex({ index });
        const param: IndicesDelete = { index, expand_wildcards: 'hidden' };
        await expect(client.delete(param)).rejects.toEqual(
            `illegal argument : ${JSON.stringify(param)}`
        );
        await client.delete({ index });
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
