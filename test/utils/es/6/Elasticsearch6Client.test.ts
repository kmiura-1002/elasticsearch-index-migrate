import 'mocha';
import { expect } from 'chai';
import * as chai from 'chai';
import ElasticsearchClient from '../../../../src/utils/es/ElasticsearchClient';
import { Bindings } from '../../../../src/ioc.bindings';
import { es6ClientContainer } from '../../ioc-test';
import * as chaiAsPromised from 'chai-as-promised';
import { cli } from 'cli-ux';

chai.use(chaiAsPromised);

describe('Elasticsearch6Client test', () => {
    const client = es6ClientContainer().get<ElasticsearchClient>(Bindings.ElasticsearchClient);

    it('version check', () => {
        expect(client.version()).is.eq('6.x');
    });
    it('exist check', async () => {
        const index = `test_index_${Math.random().toString(32).substring(2)}`;
        const exists = await client.exists(index);
        expect(exists).is.false;
    });
    it('create index', async () => {
        const index = `test_index_${Math.random().toString(32).substring(2)}`;
        const create = await client.createIndex(index);
        expect(create.statusCode).is.eq(200);
        await client.delete(index);
    });
    it('search', async () => {
        const index = `test_index_${Math.random().toString(32).substring(2)}`;
        await client.createIndex(index);
        const ret = await client.search(index);
        expect(ret).to.be.an('array');
    });
    it('put mapping', async () => {
        const index = `test_index_${Math.random().toString(32).substring(2)}`;
        await client.createIndex(index);
        const ret = await client.putMapping(index, {
            properties: {
                test_id: {
                    type: 'long'
                }
            }
        });
        expect(ret.statusCode).is.eq(200);
        await client.delete(index);
    });

    it('put settings', async () => {
        const index = `test_index_${Math.random().toString(32).substring(2)}`;
        await client.createIndex(index);
        const ret = await client.putSetting(index, {
            index: {
                number_of_replicas: 0
            }
        });
        expect(ret.statusCode).is.eq(200);
        await client.delete(index);
    });

    it('post document', async () => {
        const index = `test_index_${Math.random().toString(32).substring(2)}`;
        await client.createIndex(index);
        const ret = await client.postDocument(index, { test: 'foo baz' });

        expect(ret.statusCode).is.eq(201);
        await client.delete(index);
    });

    it('get mpping', async () => {
        const index = `test_index_${Math.random().toString(32).substring(2)}`;
        await client.createIndex(index, {
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
        const ret = await client.getMapping(index);
        expect(ret).to.eql({
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
        await client.delete(index);
    });

    it('get', async () => {
        const index = `test_index_${Math.random().toString(32).substring(2)}`;
        await client.createIndex(index, {
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
        });
        const ret = await client.get(index);

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
        await client.delete(index);
    });

    it('put template, delete template', async () => {
        const res = await client.putTemplate({
            name: 'test_template',
            order: 1,
            create: true,
            body: {
                index_patterns: ['test_index_template'],
                settings: {
                    number_of_shards: 1
                },
                mappings: {
                    _doc: {
                        properties: {
                            host_name: {
                                type: 'keyword'
                            }
                        }
                    }
                }
            }
        });
        expect(res.body).to.be.eql({
            acknowledged: true
        });
        expect(res.meta.request.params.querystring).to.be.eql('order=1&create=true');
        await client.deleteTemplate('test_template');
    });

    it('close client', async () => {
        await client.close();
        expect(client.healthCheck()).to.be.rejected;
    });
});
