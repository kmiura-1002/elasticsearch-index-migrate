import { Index } from 'es6/api/requestParams';
import { es7ClientContainer } from '../../../../../__mocks__/ioc-test';
import OldElasticsearchClient from '../../../es/ElasticsearchClient';
import { Bindings } from '../../../../ioc.bindings';

describe('Elasticsearch7Client', () => {
    const client = es7ClientContainer().get<OldElasticsearchClient>(Bindings.ElasticsearchClient);

    it('can get version', () => {
        expect(client.version()).toEqual('7.x');
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
        await client.delete({ index });
    });

    it('can call search api', async () => {
        const index = `test_index_${Math.random().toString(32).substring(2)}`;
        await client.createIndex({ index });
        const ret = await client.search({ index });
        expect(ret).toEqual([]);
        await client.delete({ index });
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
        await client.delete({ index });
    });

    it('can not call document api when args is es6 params', async () => {
        const index = `test_index_${Math.random().toString(32).substring(2)}`;
        await client.createIndex({ index });
        const param: Index = {
            index,
            type: '_doc',
            parent: '',
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
        await client.delete({ index });
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
                    properties: {
                        test_name: {
                            type: 'keyword'
                        }
                    }
                }
            }
        });
        const ret = await client.get({ index });

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
        await client.delete({ index });
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
