import * as sinon from 'sinon';
import OldElasticsearchClient from '../../../src/app/client/es/ElasticsearchClient';
import { expect } from 'chai';
import { cleanExecutor } from '../../../src/executor/clean/CleanExecutor';
import { MAPPING_HISTORY_INDEX_NAME } from '../../../src/model/types';
import { cli } from 'cli-ux';
import {
    IndicesDelete as IndicesDelete6,
    DeleteByQuery as DeleteByQuery6
} from 'es6/api/requestParams';
import {
    IndicesDelete as IndicesDelete7,
    DeleteByQuery as DeleteByQuery7
} from 'es7/api/requestParams';

describe('CleanExecutor test', () => {
    let sandbox: sinon.SinonSandbox;
    before(() => {
        sandbox = sinon.createSandbox();
    });
    afterEach(() => {
        sandbox.restore();
    });

    it('documents are removed from migration_history', async () => {
        type mockEsClient = Partial<OldElasticsearchClient>;
        const client: mockEsClient = {
            deleteDocument: (_param: DeleteByQuery6 | DeleteByQuery7): Promise<any> =>
                Promise.resolve('success')
        };
        const stub = sandbox.stub(client, 'deleteDocument').returns(Promise.resolve('success'));
        await cleanExecutor(client as OldElasticsearchClient, 'test', 'history');
        expect(stub.calledOnce).is.true;
        expect(
            stub.calledWith({
                index: MAPPING_HISTORY_INDEX_NAME,
                body: {
                    query: {
                        term: {
                            index_name: {
                                value: 'test'
                            }
                        }
                    }
                }
            })
        ).is.true;
        expect(stub.returned(Promise.resolve('success'))).is.true;
    });

    it('document failed to be removed from migration_history', async () => {
        type mockEsClient = Partial<OldElasticsearchClient>;
        const client: mockEsClient = {
            deleteDocument: (_param: DeleteByQuery6 | DeleteByQuery7) => Promise.reject('failed')
        };
        const clientStub = sandbox.stub(client, 'deleteDocument').returns(Promise.reject('failed'));
        const errorStub = sandbox.stub(cli, 'error');
        await cleanExecutor(client as OldElasticsearchClient, 'test', 'history');
        expect(clientStub.calledOnce).is.true;
        expect(errorStub.calledOnce).is.true;
        expect(errorStub.calledWith('An error occurred during the deletion process : "failed"')).is
            .true;
    });

    it('delete index from elasticsearch', async () => {
        type mockEsClient = Partial<OldElasticsearchClient>;
        const client: mockEsClient = {
            delete: (_param: IndicesDelete6 | IndicesDelete7): Promise<any> =>
                Promise.resolve('success')
        };
        const stub = sandbox.stub(client, 'delete').returns(Promise.resolve('success'));
        await cleanExecutor(client as OldElasticsearchClient, 'test', 'index');
        expect(stub.calledOnce).is.true;
        expect(stub.calledWith({ index: 'test' })).is.true;
        expect(stub.returned(Promise.resolve('success'))).is.true;
    });

    it('Failed to delete the index from elasticsearch', async () => {
        type mockEsClient = Partial<OldElasticsearchClient>;
        const client: mockEsClient = {
            delete: (_param: IndicesDelete6 | IndicesDelete7): Promise<any> =>
                Promise.resolve('failed')
        };
        const clientStub = sandbox.stub(client, 'delete').returns(Promise.reject('failed'));
        const errorStub = sandbox.stub(cli, 'error');
        await cleanExecutor(client as OldElasticsearchClient, 'test', 'index');
        expect(clientStub.calledOnce).is.true;
        expect(errorStub.calledOnce).is.true;
        expect(errorStub.calledWith('An error occurred during the deletion process : "failed"')).is
            .true;
    });

    it('delete index and migration history', async () => {
        type mockEsClient = Partial<OldElasticsearchClient>;
        const client: mockEsClient = {
            delete: (_param: IndicesDelete6 | IndicesDelete7): Promise<any> =>
                Promise.resolve('success'),
            deleteDocument: (_param: DeleteByQuery6 | DeleteByQuery7): Promise<any> =>
                Promise.resolve('success')
        };
        const deleteDocumentStub = sandbox
            .stub(client, 'deleteDocument')
            .returns(Promise.resolve('success'));
        const deleteStub = sandbox.stub(client, 'delete').returns(Promise.resolve('success'));
        await cleanExecutor(client as OldElasticsearchClient, 'test', 'all');
        expect(deleteDocumentStub.calledOnce).is.true;
        expect(
            deleteDocumentStub.calledWith({
                index: MAPPING_HISTORY_INDEX_NAME,
                body: {
                    query: {
                        term: {
                            index_name: {
                                value: 'test'
                            }
                        }
                    }
                }
            })
        ).is.true;
        expect(deleteDocumentStub.returned(Promise.resolve('success'))).is.true;
        expect(deleteStub.calledOnce).is.true;
        expect(deleteStub.calledWith({ index: 'test' })).is.true;
        expect(deleteStub.returned(Promise.resolve('success'))).is.true;
    });

    it('Deleting the index and deleting the history failed.', async () => {
        type mockEsClient = Partial<OldElasticsearchClient>;
        const client: mockEsClient = {
            deleteDocument: (_param: DeleteByQuery6 | DeleteByQuery7) => Promise.reject('failed'),
            delete: (_param: IndicesDelete6 | IndicesDelete7): Promise<any> =>
                Promise.resolve('failed')
        };
        const deleteDocumentStub = sandbox
            .stub(client, 'deleteDocument')
            .returns(Promise.reject('failed'));
        const deleteStub = sandbox.stub(client, 'delete').returns(Promise.reject('failed'));
        const errorStub = sandbox.stub(cli, 'error');
        await cleanExecutor(client as OldElasticsearchClient, 'test', 'all');
        expect(deleteDocumentStub.calledOnce).is.true;
        expect(deleteStub.calledOnce).is.true;
        expect(errorStub.calledTwice).is.true;
        expect(errorStub.calledWith('An error occurred during the deletion process : "failed"')).is
            .true;
    });
});
