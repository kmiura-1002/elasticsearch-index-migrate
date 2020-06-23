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

    it('delete index from elasticsearch', async () => {
        type mockEsClient = Partial<ElasticsearchClient>;
        const client: mockEsClient = {
            delete: (_indexName: string | string[]) => Promise.resolve('success')
        };
        const stub = sandbox.stub(client, 'delete').returns(Promise.resolve('success'));
        await cleanExecutor(client as ElasticsearchClient, 'test', 'index');
        expect(stub.calledOnce).is.true;
        expect(stub.calledWith('test')).is.true;
        expect(stub.returned(Promise.resolve('success'))).is.true;
    });

    it('Failed to delete the index from elasticsearch', async () => {
        type mockEsClient = Partial<ElasticsearchClient>;
        const client: mockEsClient = {
            delete: (_indexName: string | string[]) => Promise.resolve('failed')
        };
        const clientStub = sandbox.stub(client, 'delete').returns(Promise.reject('failed'));
        const errorStub = sandbox.stub(cli, 'error');
        await cleanExecutor(client as ElasticsearchClient, 'test', 'index');
        expect(clientStub.calledOnce).is.true;
        expect(errorStub.calledOnce).is.true;
        expect(errorStub.calledWith('An error occurred during the deletion process : "failed"')).is
            .true;
    });

    it('delete index and migration history', async () => {
        type mockEsClient = Partial<ElasticsearchClient>;
        const client: mockEsClient = {
            delete: (_indexName: string | string[]) => Promise.resolve('success'),
            deleteDocument: (_indexName: string, _body?: any) => Promise.resolve('success')
        };
        const deleteDocumentStub = sandbox
            .stub(client, 'deleteDocument')
            .returns(Promise.resolve('success'));
        const deleteStub = sandbox.stub(client, 'delete').returns(Promise.resolve('success'));
        await cleanExecutor(client as ElasticsearchClient, 'test', 'all');
        expect(deleteDocumentStub.calledOnce).is.true;
        expect(
            deleteDocumentStub.calledWith(MAPPING_HISTORY_INDEX_NAME, {
                query: {
                    term: {
                        index_name: {
                            value: 'test'
                        }
                    }
                }
            })
        ).is.true;
        expect(deleteDocumentStub.returned(Promise.resolve('success'))).is.true;
        expect(deleteStub.calledOnce).is.true;
        expect(deleteStub.calledWith('test')).is.true;
        expect(deleteStub.returned(Promise.resolve('success'))).is.true;
    });

    it('Deleting the index and deleting the history failed.', async () => {
        type mockEsClient = Partial<ElasticsearchClient>;
        const client: mockEsClient = {
            deleteDocument: (_indexName: string, _body?: any) => Promise.reject('failed'),
            delete: (_indexName: string | string[]) => Promise.resolve('failed')
        };
        const deleteDocumentStub = sandbox
            .stub(client, 'deleteDocument')
            .returns(Promise.reject('failed'));
        const deleteStub = sandbox.stub(client, 'delete').returns(Promise.reject('failed'));
        const errorStub = sandbox.stub(cli, 'error');
        await cleanExecutor(client as ElasticsearchClient, 'test', 'all');
        expect(deleteDocumentStub.calledOnce).is.true;
        expect(deleteStub.calledOnce).is.true;
        expect(errorStub.calledTwice).is.true;
        expect(errorStub.calledWith('An error occurred during the deletion process : "failed"')).is
            .true;
    });
});
