import * as sinon from 'sinon';
import ElasticsearchClient from '../../../src/utils/es/ElasticsearchClient';
import { expect } from 'chai';
import { cleanExecutor } from '../../../src/executor/clean/CleanExecutor';
import { MAPPING_HISTORY_INDEX_NAME } from '../../../src/model/types';
import { cli } from 'cli-ux';

describe('CleanExecutor test', () => {
    let sandbox: sinon.SinonSandbox;
    before(() => {
        sandbox = sinon.createSandbox();
    });
    afterEach(() => {
        sandbox.restore();
    });

    it('documents are removed from migration_history', async () => {
        type mockEsClient = Partial<ElasticsearchClient>;
        const client: mockEsClient = {
            deleteDocument: (_indexName: string, _body?: any) => Promise.resolve('success')
        };
        const stub = sandbox.stub(client, 'deleteDocument').returns(Promise.resolve('success'));
        await cleanExecutor(client as ElasticsearchClient, 'test', 'history');
        expect(stub.calledOnce).is.true;
        expect(
            stub.calledWith(MAPPING_HISTORY_INDEX_NAME, {
                query: {
                    term: {
                        index_name: {
                            value: 'test'
                        }
                    }
                }
            })
        ).is.true;
        expect(stub.returned(Promise.resolve('success'))).is.true;
    });

    it('document failed to be removed from migration_history', async () => {
        type mockEsClient = Partial<ElasticsearchClient>;
        const client: mockEsClient = {
            deleteDocument: (_indexName: string, _body?: any) => Promise.reject('failed')
        };
        const clientStub = sandbox.stub(client, 'deleteDocument').returns(Promise.reject('failed'));
        const errorStub = sandbox.stub(cli, 'error');
        await cleanExecutor(client as ElasticsearchClient, 'test', 'history');
        expect(clientStub.calledOnce).is.true;
        expect(errorStub.calledOnce).is.true;
        expect(errorStub.calledWith('An error occurred during the deletion process : "failed"')).is
            .true;
    });

    // TODO DELETE
    it('unsupported argument handling', async () => {
        type mockEsClient = Partial<ElasticsearchClient>;
        const client: mockEsClient = {};
        const errorStub = sandbox.stub(cli, 'error');
        await cleanExecutor(client as ElasticsearchClient, 'test', 'all');
        expect(errorStub.calledOnce).is.true;
        expect(errorStub.calledWith('Not implemented. Aborting the process.')).is.true;
    });
});
