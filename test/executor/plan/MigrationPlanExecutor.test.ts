import 'mocha';
import { expect } from 'chai';
import MigrationPlanExecutor from '../../../src/executor/plan/MigrationPlanExecutor';
import { MigrationStates, MigrationTypes } from '../../../src/model/types';
import { resolvedMigrations } from '../../data/ResolvedMigrationTestData';
import { migrateIndices } from '../../data/MigrateIndexTestData';
import { migrationPlanContext } from '../../data/MigrationPlanContextTestData';
import { cli } from 'cli-ux';
import * as sinon from 'sinon';

describe('MigrationPlanExecutor test', () => {
    let sandbox: sinon.SinonSandbox;
    before(() => {
        sandbox = sinon.createSandbox();
    });
    afterEach(() => {
        sandbox.restore();
    });

    it('refresh test', () => {
        const executor = MigrationPlanExecutor(
            resolvedMigrations,
            migrateIndices(new Date()),
            migrationPlanContext
        );

        const migrationPlans = executor.all;
        const outOfOrders = migrationPlans.map((value) => value.outOfOrder);
        const versions = migrationPlans.map(
            (value) => value.resolvedMigration?.version ?? value.appliedMigration?.version
        );
        expect(outOfOrders)
            .to.be.an('array')
            .to.be.include.ordered.members([false, true, false, false]);
        expect(versions)
            .to.be.an('array')
            .to.be.include.ordered.members([
                'v1.0.0',
                'v1.1.0',
                'v1.1.1',
                'v1.10.2',
                'v1.20.0',
                'v99.1.1'
            ]);
    });

    it('status test', () => {
        const executor = MigrationPlanExecutor(
            resolvedMigrations,
            migrateIndices(new Date()),
            migrationPlanContext
        );

        const status = executor.all.map((value) => value.state?.status);
        expect(status)
            .to.be.an('array')
            .to.be.include.ordered.members([
                MigrationStates.MISSING_SUCCESS,
                MigrationStates.IGNORED,
                MigrationStates.SUCCESS,
                MigrationStates.MISSING_FAILED,
                MigrationStates.SUCCESS,
                MigrationStates.PENDING
            ]);
    });

    it('Verification of the result filtered by pending status.', () => {
        const executor = MigrationPlanExecutor(
            resolvedMigrations,
            migrateIndices(new Date()),
            migrationPlanContext
        );

        const pendingInfos = executor.pending;
        const status = pendingInfos.map((value) => value.state?.status);
        expect(status).to.be.an('array').to.be.include.ordered.members([MigrationStates.PENDING]);
    });

    it('resolvedMigrations duplicates', () => {
        const executor = MigrationPlanExecutor(
            [...resolvedMigrations, ...resolvedMigrations],
            migrateIndices(new Date()),
            migrationPlanContext
        );

        const pendingInfos = executor.pending;
        const status = pendingInfos.map((value) => value.state?.status);
        expect(status).to.be.an('array').to.be.include.ordered.members([MigrationStates.PENDING]);
    });

    it('Unknown version migration detected', () => {
        const stub = sandbox.stub(cli, 'error');

        MigrationPlanExecutor(
            [
                {
                    migrate_script: {},
                    type: MigrationTypes.CREATE_INDEX,
                    version: 'Unknown version',
                    description: '',
                    index_name: 'test',
                    physicalLocation: { name: '', ext: '', dir: '', base: '', root: '' }
                }
            ],
            [],
            migrationPlanContext
        );

        expect(stub.called).is.true;
        expect(stub.calledWith('Unknown version migration detected')).is.true;
    });
});
