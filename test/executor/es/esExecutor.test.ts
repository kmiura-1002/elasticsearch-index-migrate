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
    it('putMapping', async () => {
        const client = new MockElasticsearchClient();
        const stub = sandbox.stub(client).putMapping.returns(Promise.resolve({ statusCode: 200 }));
        const executor = esExecutor.get(MigrationTypes.ADD_FIELD) as ExecutorFnc;
        const ret = await executor(client, {} as any);
        expect(ret).to.deep.eq({ statusCode: 200 });
        expect(stub.calledOnce).is.true;
    });

    it('createIndex', async () => {
        const client = new MockElasticsearchClient();
        const stub = sandbox.stub(client).createIndex.returns(Promise.resolve({ statusCode: 200 }));
        const executor = esExecutor.get(MigrationTypes.CREATE_INDEX) as ExecutorFnc;
        const ret = await executor(client, {} as any);
        expect(ret).to.deep.eq({ statusCode: 200 });
        expect(stub.calledOnce).is.true;
    });

    it('putTemplate', async () => {
        const client = new MockElasticsearchClient();
        const stub = sandbox.stub(client).putTemplate.returns(
            Promise.resolve({
                body: {
                    acknowledged: true
                }
            })
        );
        const executor = esExecutor.get(
            MigrationTypes.CREATE_OR_UPDATE_INDEX_TEMPLATE
        ) as ExecutorFnc;
        const ret = await executor(client, {} as any);
        expect(ret).to.deep.eq({
            body: {
                acknowledged: true
            }
        });
        expect(stub.calledOnce).is.true;
    });
});
