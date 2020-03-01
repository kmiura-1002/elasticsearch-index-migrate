import 'mocha';
import { expect } from 'chai';
import MigrationInfoExecutor from '../../../src/executor/info/MigrationInfoExecutor';
import { MigrationState } from '../../../src/model/types';
import { resolvedMigrations } from '../../data/ResolvedMigrationTestData';
import { migrateIndices } from '../../data/MigrateIndexTestData';
import { migrationInfoContext } from '../../data/MigrationInfoContextTestData';

describe('MigrationInfoExecutor test', () => {
    it('refresh test', () => {
        const executor = new MigrationInfoExecutor(
            resolvedMigrations,
            migrateIndices(new Date()),
            migrationInfoContext
        );

        const migrationInfos = executor.all();
        const outOfOrders = migrationInfos.map((value) => value.outOfOrder);
        const versions = migrationInfos.map(
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
        const executor = new MigrationInfoExecutor(
            resolvedMigrations,
            migrateIndices(new Date()),
            migrationInfoContext
        );

        const status = executor.all().map((value) => value.state?.status);
        expect(status)
            .to.be.an('array')
            .to.be.include.ordered.members([
                MigrationState.MISSING_SUCCESS,
                MigrationState.IGNORED,
                MigrationState.SUCCESS,
                MigrationState.MISSING_FAILED,
                MigrationState.SUCCESS,
                MigrationState.PENDING
            ]);
    });

    it('Verification of the result filtered by pending status.', () => {
        const executor = new MigrationInfoExecutor(
            resolvedMigrations,
            migrateIndices(new Date()),
            migrationInfoContext
        );

        const pendingInfos = executor.pending();
        const status = pendingInfos.map((value) => value.state?.status);
        expect(status)
            .to.be.an('array')
            .to.be.include.ordered.members([MigrationState.PENDING]);
    });
});
