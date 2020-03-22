import 'mocha';
import { expect } from 'chai';
import * as sinon from 'sinon';
import * as EsUtils from '../../../src/utils/es/EsUtils';
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
    it('putMapping', async () => {
        const executor = esExecutor.get(MigrationTypes.ADD_FIELD) as ExecutorFnc;
        const client = new MockElasticsearchClient();
        const stub = sandbox.stub(client).putMapping.returns(Promise.resolve({ statusCode: 200 }));
        const ret = await executor(client, {} as any);
        expect(ret).to.deep.eq({ statusCode: 200 });
        expect(stub.calledOnce).is.true;
    });

    it('createIndex', async () => {
        const executor = esExecutor.get(MigrationTypes.CREATE_INDEX) as ExecutorFnc;
        const client = new MockElasticsearchClient();
        const stub = sandbox.stub(client).createIndex.returns(Promise.resolve({ statusCode: 200 }));
        const ret = await executor(client, {} as any);
        expect(ret).to.deep.eq({ statusCode: 200 });
        expect(stub.calledOnce).is.true;
    });
});
