import 'mocha';
import { expect } from 'chai';
import MigrationInfoExecutor from '../../../src/executor/info/MigrationInfoExecutor';
import { MigrationState, MigrationStateInfo } from '../../../src/model/types';
import { resolvedMigrations } from '../../data/ResolvedMigrationTestData';
import { migrateIndices } from '../../data/MigrateIndexTestData';
import { migrationInfoContext } from '../../data/MigrationInfoContextTestData';

describe('MigrationInfoExecutor test', () => {
    it('refresh test', () => {
        const service = new MigrationInfoExecutor(
            resolvedMigrations,
            migrateIndices(new Date()),
            migrationInfoContext
        );

        service.refresh();
        const migrationInfos = service.all();
        const outOfOrders = migrationInfos.map((value) => value.outOfOrder);
        const versions = migrationInfos.map(
            (value) => value.resolvedMigration?.version ?? value.appliedMigration?.version
        );
        expect(outOfOrders)
            .to.be.an('array')
            .to.be.include.ordered.members([false, true, false, false]);
        expect(versions)
            .to.be.an('array')
            .to.be.include.ordered.members(['v1.0.0', 'v1.1.0', 'v1.1.1', 'v1.20.0']);
    });

    it('status test', () => {
        const service = new MigrationInfoExecutor(
            resolvedMigrations,
            migrateIndices(new Date()),
            migrationInfoContext
        );

        service.refresh();
        const status = service.all().map((value) => value.getState()?.status);
        expect(status)
            .to.be.an('array')
            .to.be.include.ordered.members([
                MigrationState.BASELINE,
                MigrationState.IGNORED,
                MigrationState.SUCCESS,
                MigrationState.SUCCESS
            ]);
    });

    it('Verification of the result filtered by applied status.', () => {
        const service = new MigrationInfoExecutor(
            resolvedMigrations,
            migrateIndices(new Date()),
            migrationInfoContext
        );

        service.refresh();
        const appliedInfos = service.applied();
        const status = appliedInfos.map((value) => value.getState()?.status);
        expect(status)
            .to.be.an('array')
            .to.be.include.ordered.members([
                MigrationState.BASELINE,
                MigrationState.SUCCESS,
                MigrationState.SUCCESS
            ]);
    });

    it('Verification of the result filtered by current status.', () => {
        const service = new MigrationInfoExecutor(
            resolvedMigrations,
            migrateIndices(new Date()),
            migrationInfoContext
        );

        service.refresh();
        const currentInfo = service.current();
        expect(currentInfo?.getState()).to.be.eq(MigrationStateInfo.get(MigrationState.SUCCESS));
    });

    it('Verification of the result filtered by pending status.', () => {
        const service = new MigrationInfoExecutor(
            resolvedMigrations,
            migrateIndices(new Date()),
            migrationInfoContext
        );

        service.refresh();
        const pendingInfos = service.pending();
        const status = pendingInfos.map((value) => value.getState()?.status);
        expect(status)
            .to.be.an('array')
            .to.be.include.ordered.members([MigrationState.PENDING]);
    });
});
