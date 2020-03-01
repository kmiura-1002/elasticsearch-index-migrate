import 'mocha';
import { expect } from 'chai';
import ElasticsearchClient from '../../../src/utils/es/ElasticsearchClient';
import {
    addMigrationHistory,
    applyMigration,
    makeMigrateHistory
} from '../../../src/executor/migration/MigrationExecutor';
import * as MigrationExecutor from '../../../src/executor/migration/MigrationExecutor';
import { MigrateIndex, MigrationType } from '../../../src/model/types';
import * as sinon from 'sinon';
import { cli } from 'cli-ux';
import { generateMigrationInfo } from '../../../src/executor/info/MigrationInfo';
import { migrationInfoContext } from '../../data/MigrationInfoContextTestData';
import { formatDateAsIsoString } from '../../../src/utils/makeDetail';

describe('MigrationExecutor test', () => {
    it('failed addMigrationHistory', async () => {
        const stub = sinon.stub(cli, 'warn');
        type mockEsClient = Partial<ElasticsearchClient>;

        const client: mockEsClient = {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            postDocument: (index: string, body?: any, id?: string) => Promise.reject()
        };
        await addMigrationHistory(client as ElasticsearchClient, {} as MigrateIndex);
        expect(stub.calledOnce).is.true;
        expect(stub.calledWith('Failed to save history. (Failed Data: {}, response: undefined)')).is
            .true;
        stub.restore();
    });

    it('Migration history saved successfully', async () => {
        const stub = sinon.stub(cli, 'info');
        type mockEsClient = Partial<ElasticsearchClient>;
        const client: mockEsClient = {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            postDocument: (index: string, body?: any, id?: string) => Promise.resolve()
        };
        await addMigrationHistory(client as ElasticsearchClient, {} as MigrateIndex);
        expect(stub.calledOnce).is.true;
        expect(stub.calledWith('POST Success. Migration history saved successfully. (undefined)'))
            .is.true;
        stub.restore();
    });

    it('Make MigrateHistory Object', () => {
        const date = new Date();
        const info = generateMigrationInfo(
            migrationInfoContext,
            false,
            {
                migrate_script: {},
                type: MigrationType.CREATE_INDEX,
                version: 'v1.0.0',
                description: '',
                index_name: 'test',
                physicalLocation: { name: '', ext: '', dir: '', base: '', root: '' }
            },
            {
                version: 'v1.0.0',
                description: '',
                type: MigrationType.ADD_FIELD,
                script: '',
                installedOn: date,
                executionTime: 1,
                success: true
            }
        );
        const history = makeMigrateHistory(info, 1, true);

        expect(history).to.be.deep.include({
            index_name: 'test',
            migrate_version: 'v1.0.0',
            description: '',
            script_name: '',
            script_type: 'ADD_FIELD',
            installed_on: formatDateAsIsoString(date),
            execution_time: 1,
            success: true
        });
    });

    it('applyMigration createIndex test', async () => {
        const migrationExecutorMock = sinon.mock(MigrationExecutor);
        migrationExecutorMock.verify();
        migrationExecutorMock.expects('addMigrationHistory');

        const tmpClient = {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            createIndex: (index: string, body?: any) => Promise.resolve({ statusCode: 200 }),
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            postDocument: (index: string, body?: any, id?: string) =>
                Promise.resolve({ statusCode: 200 })
        } as ElasticsearchClient;
        const createIndexStub = sinon
            .stub(tmpClient, 'createIndex')
            .returns(Promise.resolve({ statusCode: 200 }));
        const postDocumentStub = sinon
            .stub(tmpClient, 'postDocument')
            .returns(Promise.resolve({ statusCode: 200 }));
        const cliInfoStub = sinon.stub(cli, 'info');
        const cliWarnStub = sinon.stub(cli, 'warn');

        const info = generateMigrationInfo(
            migrationInfoContext,
            false,
            {
                migrate_script: {},
                type: MigrationType.CREATE_INDEX,
                version: 'v1.0.1',
                description: '',
                index_name: 'test',
                physicalLocation: { name: '', ext: '', dir: '', base: '', root: '' }
            },
            {
                version: 'v1.0.0',
                description: '',
                type: MigrationType.ADD_FIELD,
                script: '',
                installedOn: new Date(),
                executionTime: 1,
                success: true
            }
        );

        const ret = await applyMigration(tmpClient, info);
        expect(ret).is.eq(1);
        expect(createIndexStub.calledOnce).is.true;
        expect(postDocumentStub.calledOnce).is.true;
        expect(cliInfoStub.calledTwice).is.true;
        expect(cliWarnStub.notCalled).is.true;

        migrationExecutorMock.restore();
        createIndexStub.restore();
        postDocumentStub.restore();
        cliInfoStub.restore();
        cliWarnStub.restore();
    });

    it('applyMigration putMapping test', async () => {
        const migrationExecutorMock = sinon.mock(MigrationExecutor);
        migrationExecutorMock.verify();
        migrationExecutorMock.expects('addMigrationHistory');

        const tmpClient = {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            putMapping: (index: string, body?: any) => Promise.resolve({ statusCode: 200 }),
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            postDocument: (index: string, body?: any, id?: string) =>
                Promise.resolve({ statusCode: 200 })
        } as ElasticsearchClient;
        const putMappingStub = sinon
            .stub(tmpClient, 'putMapping')
            .returns(Promise.resolve({ statusCode: 200 }));
        const postDocumentStub = sinon
            .stub(tmpClient, 'postDocument')
            .returns(Promise.resolve({ statusCode: 200 }));
        const cliInfoStub = sinon.stub(cli, 'info');
        const cliWarnStub = sinon.stub(cli, 'warn');

        const info = generateMigrationInfo(
            migrationInfoContext,
            false,
            {
                migrate_script: {},
                type: MigrationType.ADD_FIELD,
                version: 'v1.0.1',
                description: '',
                index_name: 'test',
                physicalLocation: { name: '', ext: '', dir: '', base: '', root: '' }
            },
            {
                version: 'v1.0.0',
                description: '',
                type: MigrationType.ADD_FIELD,
                script: '',
                installedOn: new Date(),
                executionTime: 1,
                success: true
            }
        );

        const ret = await applyMigration(tmpClient, info);
        expect(ret).is.eq(1);
        expect(putMappingStub.calledOnce).is.true;
        expect(postDocumentStub.calledOnce).is.true;
        expect(cliInfoStub.calledTwice).is.true;
        expect(cliWarnStub.notCalled).is.true;

        migrationExecutorMock.restore();
        putMappingStub.restore();
        postDocumentStub.restore();
        cliInfoStub.restore();
        cliWarnStub.restore();
    });
});
