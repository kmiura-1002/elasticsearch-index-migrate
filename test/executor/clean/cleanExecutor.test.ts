import * as sinon from 'sinon';
import { cli } from 'cli-ux';
import ElasticsearchClient from '../../../src/utils/es/ElasticsearchClient';
import { addMigrationHistory } from '../../../src/executor/migration/MigrationExecutor';
import { MigrateIndex } from '../../../src/model/types';
import { expect } from 'chai';
import { cleanExecutor } from '../../../src/executor/clean/CleanExecutor';
import exp = require('constants');

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
        await cleanExecutor(client as ElasticsearchClient, 'test', 'history').then((value) =>
            expect(value).eql('success')
        );
    });

    it('document failed to be removed from migration_history', async () => {
        type mockEsClient = Partial<ElasticsearchClient>;
        const client: mockEsClient = {
            deleteDocument: (_indexName: string, _body?: any) => Promise.reject('failed')
        };
        await cleanExecutor(client as ElasticsearchClient, 'test', 'history').catch((value) =>
            expect(value).eql('failed')
        );
    });

    // TODO DELETE
    it('unsupported argument handling', async () => {
        type mockEsClient = Partial<ElasticsearchClient>;
        const client: mockEsClient = {};
        await cleanExecutor(client as ElasticsearchClient, 'test', 'all').catch((value) =>
            expect(value).eql('Not implemented. Aborting the process.')
        );
        await cleanExecutor(client as ElasticsearchClient, 'test', 'index').catch((value) =>
            expect(value).eql('Not implemented. Aborting the process.')
        );
    });
});
