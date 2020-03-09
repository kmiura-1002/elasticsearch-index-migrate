import 'mocha';
import { assert, expect } from 'chai';
import * as chai from 'chai';
import ElasticsearchClient from '../../../../src/utils/es/ElasticsearchClient';
import { Bindings } from '../../../../src/ioc.bindings';
// @ts-ignore
import { es7ClientContainer } from '../../ioc-test';
import * as chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);

describe('Elasticsearch7Client test', () => {
    const client = es7ClientContainer().get<ElasticsearchClient>(Bindings.ElasticsearchClient);
    it('version check', () => {
        assert.equal(client.version(), '7.x');
    });

    it('exist check', async () => {
        const index = `test_index_${Math.random()
            .toString(32)
            .substring(2)}`;
        const exists = await client.exists(index);
        assert.isFalse(exists);
    });
    it('create index', async () => {
        const index = `test_index_${Math.random()
            .toString(32)
            .substring(2)}`;
        const create = await client.createIndex(index);
        assert.equal(create.statusCode, '200');
    });
    it('search', async () => {
        const index = `test_index_${Math.random()
            .toString(32)
            .substring(2)}`;
        await client.createIndex(index);
        const ret = await client.search(index);
        assert.isArray(ret);
    });
    it('put mapping', async () => {
        const index = `test_index_${Math.random()
            .toString(32)
            .substring(2)}`;
        await client.createIndex(index);
        const ret = await client.putMapping(index, {
            properties: {
                // eslint-disable-next-line @typescript-eslint/camelcase
                test_id: {
                    type: 'long'
                }
            }
        });
        assert.equal(ret.statusCode, '200');
    });

    it('put settings', async () => {
        const index = `test_index_${Math.random()
            .toString(32)
            .substring(2)}`;
        await client.createIndex(index);
        const ret = await client.putSetting(index, {
            index: {
                number_of_replicas: 0
            }
        });
        assert.equal(ret.statusCode, '200');
    });

    it('post document', async () => {
        const index = `test_index_${Math.random()
            .toString(32)
            .substring(2)}`;
        await client.createIndex(index);
        const ret = await client.postDocument(index, { test: 'foo baz' });

        expect(ret.statusCode).is.eq(201);
    });

    it('close client', async () => {
        await client.close();
        expect(client.healthCheck()).to.be.rejected;
    });
});
