import 'mocha';
import { expect } from 'chai';
import * as chai from 'chai';
import ElasticsearchClient from '../../../../src/utils/es/ElasticsearchClient';
import { Bindings } from '../../../../src/ioc.bindings';
import { es6ClientContainer } from '../../ioc-test';
import chaiAsPromised from 'chai-as-promised';
import {
    Index,
    IndicesDelete,
    IndicesExists,
    IndicesGet,
    IndicesGetMapping,
    IndicesPutMapping,
    IndicesPutSettings,
    Search
} from 'es7/api/requestParams';

chai.use(chaiAsPromised);

describe('Elasticsearch6Client test', () => {
    const client = es6ClientContainer().get<ElasticsearchClient>(Bindings.ElasticsearchClient);

    it('version check', () => {
        expect(client.version()).is.eq('6.x');
    });

    it('exist check', async () => {
        const index = `test_index_${Math.random().toString(32).substring(2)}`;
        const exists = await client.exists({ index });
        expect(exists).is.false;
    });

    it('exist check with args is es7 params', async () => {
        const index = `test_index_${Math.random().toString(32).substring(2)}`;
        const param: IndicesExists = { index, expand_wildcards: 'hidden' };
        await expect(client.exists(param)).is.rejectedWith(
            `illegal argument : ${JSON.stringify(param)}`
        );
    });

    it('create index', async () => {
        const index = `test_index_${Math.random().toString(32).substring(2)}`;
        const create = await client.createIndex({ index });
        expect(create.statusCode).is.eq(200);
        await client.delete({ index });
    });

    it('search', async () => {
        const index = `test_index_${Math.random().toString(32).substring(2)}`;
        await client.createIndex({ index });
        const ret = await client.search({ index });
        expect(ret).to.be.an('array');
    });

    it('search with args is es7 params 1', async () => {
        const index = `test_index_${Math.random().toString(32).substring(2)}`;
        await client.createIndex({ index });
        const param: Search = { index, ccs_minimize_roundtrips: false };
        await expect(client.search(param)).is.rejectedWith(
            `illegal argument : ${JSON.stringify(param)}`
        );
    });

    it('search with args is es7 params 2', async () => {
        const index = `test_index_${Math.random().toString(32).substring(2)}`;
        await client.createIndex({ index });
        const param: Search = { index, expand_wildcards: 'hidden' };
        await expect(client.search(param)).is.rejectedWith(
            `illegal argument : ${JSON.stringify(param)}`
        );
    });

    it('put mapping', async () => {
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
        expect(ret.statusCode).is.eq(200);
        await client.delete({ index });
    });

    it('put mapping with args is es7 params', async () => {
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
        await expect(client.putMapping(param)).is.rejectedWith(
            `illegal argument : ${JSON.stringify(param)}`
        );
        await client.delete({ index });
    });

    it('put mapping not exists type param', async () => {
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
        expect(ret.statusCode).is.eq(200);
        await client.delete({ index });
    });

    it('put settings', async () => {
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
        expect(ret.statusCode).is.eq(200);
        await client.delete({ index });
    });

    it('put settings with args is es7 params', async () => {
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
        await expect(client.putSetting(param)).is.rejectedWith(
            `illegal argument : ${JSON.stringify(param)}`
        );
        await client.delete({ index });
    });

    it('post document', async () => {
        const index = `test_index_${Math.random().toString(32).substring(2)}`;
        await client.createIndex({ index });
        const ret = await client.postDocument({
            index,
            type: '_doc',
            body: {
                test: 'foo baz'
            }
        });

        expect(ret.statusCode).is.eq(201);
        await client.delete({ index });
    });

    it('post document with args is es7 params', async () => {
        const index = `test_index_${Math.random().toString(32).substring(2)}`;
        await client.createIndex({ index });
        const param: Index = {
            index,
            body: {
                test: 'foo baz'
            }
        };

        await expect(client.postDocument(param)).is.rejectedWith(
            `illegal argument : ${JSON.stringify(param)}`
        );
        await client.delete({ index });
    });

    it('get mpping', async () => {
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
        expect(ret).is.an('array').lengthOf(1);
        expect(ret[0]).to.eql({
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

    it('get mpping return reject when args is es7 params', async () => {
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
        await expect(client.getMapping(param)).is.rejectedWith(
            `illegal argument : ${JSON.stringify(param)}`
        );
        await client.delete({ index });
    });

    it('get', async () => {
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

        expect((ret as any)[index].mappings).to.eql({
            test: {
                properties: {
                    test_name: {
                        type: 'keyword'
                    }
                }
            }
        });
        expect((ret as any)[index].aliases).to.eql({});
        expect((ret as any)[index].settings.index.refresh_interval).to.eql('1s');
        expect((ret as any)[index].settings.index.number_of_shards).to.eql('1');
        expect((ret as any)[index].settings.index.number_of_replicas).to.eql('0');
        await client.delete({ index });
    });

    it('get return reject when args is es7 params', async () => {
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
        expect(client.get(param)).is.rejectedWith(`illegal argument : ${JSON.stringify(param)}`);
        await client.delete({ index });
    });

    it('delete document', async () => {
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
            .then((value) => expect(value.statusCode).is.eq(201));

        await client.search({ index }).then((value) => {
            expect(value).to.be.an('array');
            expect(value[0]).to.eql({
                test: 'foobaz'
            });
        });

        await client
            .deleteDocument(index, {
                query: {
                    term: {
                        test: {
                            value: 'foobaz'
                        }
                    }
                }
            })
            .then((value) => expect(value.statusCode).is.eq(200));
        await new Promise((resolve) => setTimeout(resolve, 2000));

        await client.search({ index }).then((value) => {
            expect(value).to.be.an('array');
            expect(value.length).to.eql(0);
        });

        await client.delete({ index });
    });

    it('delete index reject when args is es7 params', async () => {
        const index = `test_index_${Math.random().toString(32).substring(2)}`;
        await client.createIndex({ index });
        const param: IndicesDelete = { index, expand_wildcards: 'hidden' };
        await expect(client.delete(param)).is.rejectedWith(
            `illegal argument : ${JSON.stringify(param)}`
        );
    });

    it('close client', async () => {
        await client.close();
        expect(client.healthCheck()).to.be.rejected;
    });
});
