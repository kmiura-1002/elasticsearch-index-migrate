/* eslint-env node, mocha */
import 'mocha';
import { expect } from 'chai';
import ElasticsearchClient from '../../../src/utils/es/ElasticsearchClient';
import {
    addMigrationHistory,
    applyMigration,
    makeMigrateHistory,
    migrate
} from '../../../src/executor/migration/MigrationExecutor';
import * as MigrationExecutor from '../../../src/executor/migration/MigrationExecutor';
import { MigrateIndex, MigrationTypes } from '../../../src/model/types';
import * as sinon from 'sinon';
import { cli } from 'cli-ux';
import { generateMigrationPlan } from '../../../src/executor/plan/MigrationPlan';
import { migrationPlanContext } from '../../data/MigrationPlanContextTestData';
import { formatDateAsIsoString } from '../../../src/utils/makeDetail';
import * as EsUtils from '../../../src/utils/es/EsUtils';
import MockElasticsearchClient from '../../mock/MockElasticsearchClient';

describe('MigrationExecutor test', () => {
    let sandbox: sinon.SinonSandbox;
    before(() => {
        sandbox = sinon.createSandbox();
    });
    afterEach(() => {
        sandbox.restore();
    });
    it('failed addMigrationHistory', async () => {
        const stub = sandbox.stub(cli, 'warn');
        type mockEsClient = Partial<ElasticsearchClient>;

        const client: mockEsClient = {
            postDocument: (index: string, body?: any, id?: string) => Promise.reject()
        };
        await addMigrationHistory(client as ElasticsearchClient, {} as MigrateIndex);
        expect(stub.calledOnce).is.true;
        expect(stub.calledWith('Failed to save history. (Failed Data: {}, response: undefined)')).is
            .true;
    });

    it('Migration history saved successfully', async () => {
        const stub = sandbox.stub(cli, 'info');
        type mockEsClient = Partial<ElasticsearchClient>;
        const client: mockEsClient = {
            postDocument: (index: string, body?: any, id?: string) => Promise.resolve()
        };
        await addMigrationHistory(client as ElasticsearchClient, {} as MigrateIndex);
        expect(stub.calledOnce).is.true;
        expect(stub.calledWith('POST Success. Migration history saved successfully. (undefined)'))
            .is.true;
    });

    it('Make MigrateHistory Object', () => {
        const date = new Date();
        const info = generateMigrationPlan(
            migrationPlanContext,
            false,
            {
                migrate_script: {},
                type: MigrationTypes.CREATE_INDEX,
                version: 'v1.0.0',
                description: '',
                index_name: 'test',
                physicalLocation: { name: '', ext: '', dir: '', base: '', root: '' }
            },
            {
                version: 'v1.0.0',
                description: '',
                type: MigrationTypes.ADD_FIELD,
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
        const migrationExecutorMock = sandbox.mock(MigrationExecutor);
        migrationExecutorMock.verify();
        migrationExecutorMock.expects('addMigrationHistory');

        const tmpClient = {
            createIndex: (index: string, body?: any) => Promise.resolve({ statusCode: 200 }),
            postDocument: (index: string, body?: any, id?: string) =>
                Promise.resolve({ statusCode: 200 })
        } as ElasticsearchClient;
        const createIndexStub = sandbox
            .stub(tmpClient, 'createIndex')
            .returns(Promise.resolve({ statusCode: 200 }));
        const postDocumentStub = sandbox
            .stub(tmpClient, 'postDocument')
            .returns(Promise.resolve({ statusCode: 200 }));
        const cliInfoStub = sandbox.stub(cli, 'info');
        const cliWarnStub = sandbox.stub(cli, 'warn');

        const info = generateMigrationPlan(
            migrationPlanContext,
            false,
            {
                migrate_script: {},
                type: MigrationTypes.CREATE_INDEX,
                version: 'v1.0.1',
                description: '',
                index_name: 'test',
                physicalLocation: { name: '', ext: '', dir: '', base: '', root: '' }
            },
            {
                version: 'v1.0.0',
                description: '',
                type: MigrationTypes.ADD_FIELD,
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
    });

    it('applyMigration putMapping test', async () => {
        const migrationExecutorMock = sandbox.mock(MigrationExecutor);
        migrationExecutorMock.verify();
        migrationExecutorMock.expects('addMigrationHistory');

        const tmpClient = {
            putMapping: (index: string, body?: any) => Promise.resolve({ statusCode: 200 }),
            postDocument: (index: string, body?: any, id?: string) =>
                Promise.resolve({ statusCode: 200 })
        } as ElasticsearchClient;
        const putMappingStub = sandbox
            .stub(tmpClient, 'putMapping')
            .returns(Promise.resolve({ statusCode: 200 }));
        const postDocumentStub = sandbox
            .stub(tmpClient, 'postDocument')
            .returns(Promise.resolve({ statusCode: 200 }));
        const cliInfoStub = sandbox.stub(cli, 'info');
        const cliWarnStub = sandbox.stub(cli, 'warn');

        const info = generateMigrationPlan(
            migrationPlanContext,
            false,
            {
                migrate_script: {},
                type: MigrationTypes.ADD_FIELD,
                version: 'v1.0.1',
                description: '',
                index_name: 'test',
                physicalLocation: { name: '', ext: '', dir: '', base: '', root: '' }
            },
            {
                version: 'v1.0.0',
                description: '',
                type: MigrationTypes.ADD_FIELD,
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
    });

    it('No migration target', async () => {
        const cliWarnStub = sandbox.stub(cli, 'warn');
        const info = generateMigrationPlan(migrationPlanContext, false, undefined, {
            version: 'v1.0.0',
            description: '',
            type: MigrationTypes.ADD_FIELD,
            script: '',
            installedOn: new Date(),
            executionTime: 1,
            success: true
        });

        const ret = await applyMigration({} as ElasticsearchClient, info);
        expect(ret).is.eq(0);
        expect(cliWarnStub.calledOnce).is.true;
        expect(cliWarnStub.calledWith('No migration target.')).is.true;
        cliWarnStub.restore();
    });

    it('Migration test', async () => {
        const esUtilsStub = sandbox.stub(EsUtils).default;
        esUtilsStub.returns(new MockElasticsearchClient());
        const cliInfoStub = sandbox.stub(cli, 'info');
        const ret = await MigrationExecutor.migrate(
            [
                {
                    migrate_script: {},
                    type: MigrationTypes.ADD_FIELD,
                    version: 'v1.0.1',
                    description: '',
                    index_name: 'test',
                    physicalLocation: { name: '', ext: '', dir: '', base: '', root: '' }
                }
            ],
            [
                {
                    index_name: '',
                    migrate_version: 'v1.0.0',
                    description: '',
                    script_name: '',
                    script_type: '',
                    installed_on: '',
                    execution_time: 1,
                    success: true
                }
            ],
            migrationPlanContext,
            { connect: {} }
        );
        expect(esUtilsStub.calledOnce).true;
        expect(cliInfoStub.callCount).to.eq(5);
        expect(cliInfoStub.calledWith('Start validate of migration data.')).is.true;
        expect(cliInfoStub.calledWith('Start migration!')).is.true;
        expect(
            cliInfoStub.calledWith(
                'POST Success. Migration history saved successfully. ({"statusCode":200})'
            )
        ).is.true;
        expect(ret).to.eq(1);
    });

    it('Migration validate test', async () => {
        const cliErrorStub = sandbox.stub(cli, 'error');
        const esUtilsStub = sandbox.stub(EsUtils).default;
        esUtilsStub.returns(new MockElasticsearchClient());
        expect(
            migrate(
                [
                    {
                        migrate_script: {},
                        type: MigrationTypes.ADD_FIELD,
                        version: 'v1.0.1',
                        description: '',
                        index_name: 'test',
                        physicalLocation: { name: '', ext: '', dir: '', base: '', root: '' }
                    }
                ],
                [
                    {
                        index_name: '',
                        migrate_version: 'v1.0.2',
                        description: '',
                        script_name: '',
                        script_type: '',
                        installed_on: '',
                        execution_time: 1,
                        success: true
                    }
                ],
                migrationPlanContext,
                { connect: {} }
            )
        ).to.exist;
        expect(cliErrorStub.calledOnce).is.true;
        expect(
            cliErrorStub.calledWith(
                'Migration data problem detected:\nResolved migrations detected have not been applied to the index (v1.0.1)'
            )
        ).is.true;
    });
});
