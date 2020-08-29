import 'mocha';
import { expect } from 'chai';
import * as sinon from 'sinon';
import MockElasticsearchClient from '../../mock/MockElasticsearchClient';
import { esExecutor, ExecutorFnc } from '../../../src/executor/es/esExecutor';
import { MigrationTypes } from '../../../src/model/types';

describe('esExecutor test', () => {
    let sandbox: sinon.SinonSandbox;
    before(() => {
        sandbox = sinon.createSandbox();
    });
    afterEach(() => {
        sandbox.restore();
    });
    it('The ability to putMapping', async () => {
        const client = new MockElasticsearchClient();
        const stub = sandbox.stub(client).putMapping.returns(Promise.resolve({ statusCode: 200 }));
        const executor = esExecutor.get(MigrationTypes.ADD_FIELD) as ExecutorFnc;
        const ret = await executor('', client, {} as any);
        expect(ret).to.deep.eq({ statusCode: 200 });
        expect(stub.calledOnce).is.true;
    });

    it('The ability to createIndex', async () => {
        const client = new MockElasticsearchClient();
        const stub = sandbox.stub(client).createIndex.returns(Promise.resolve({ statusCode: 200 }));
        const executor = esExecutor.get(MigrationTypes.CREATE_INDEX) as ExecutorFnc;
        const ret = await executor('', client, {} as any);
        expect(ret).to.deep.eq({ statusCode: 200 });
        expect(stub.calledOnce).is.true;
    });

    it('The ability to deleteIndex', async () => {
        const client = new MockElasticsearchClient();
        const stub = sandbox.stub(client).delete.returns(Promise.resolve({ statusCode: 200 }));
        const executor = esExecutor.get(MigrationTypes.DELETE_INDEX) as ExecutorFnc;
        const ret = await executor('', client, {} as any);
        expect(ret).to.deep.eq({ statusCode: 200 });
        expect(stub.calledOnce).is.true;
    });

    it('The ability to alterSetting', async () => {
        const client = new MockElasticsearchClient();
        const stub = sandbox.stub(client).putSetting.returns(Promise.resolve({ statusCode: 200 }));
        const executor = esExecutor.get(MigrationTypes.ALTER_SETTING) as ExecutorFnc;
        const ret = await executor('', client, {} as any);
        expect(ret).to.deep.eq({ statusCode: 200 });
        expect(stub.calledOnce).is.true;
    });
});
