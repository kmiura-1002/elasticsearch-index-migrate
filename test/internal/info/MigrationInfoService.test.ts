import 'mocha';
import { expect } from 'chai';
import MigrationInfoService from '../../../src/internal/info/MigrationInfoService';
import { MigrationInfoContext, MigrationState } from '../../../src/model/types';
import { appliedMigrations } from '../../data/AppliedMigrationTestData';
import { resolvedMigrations } from '../../data/MigrateIndexTestData';

const context: MigrationInfoContext = {
    outOfOrder: true,
    pending: true,
    missing: true,
    ignored: true,
    future: true,
    target: '',
    baseline: '',
    lastResolved: '',
    lastApplied: ''
};

describe('MigrationInfoService test', () => {
    it('refresh test', () => {
        const service = new MigrationInfoService(appliedMigrations, resolvedMigrations, context);

        service.refresh();
        const migrationInfos = service.all();
        const outOfOrders = migrationInfos.map((value) => value.outOfOrder);
        const versions = migrationInfos.map(
            (value) => value.appliedMigration?.version ?? value.resolvedMigration?.version
        );
        expect(outOfOrders)
            .to.be.an('array')
            .to.be.include.ordered.members([false, true, false, false]);
        expect(versions)
            .to.be.an('array')
            .to.be.include.ordered.members(['v1.0.0', 'v1.1.0', 'v1.1.1', 'v1.20.0']);
    });

    it('status test', () => {
        const service = new MigrationInfoService(appliedMigrations, resolvedMigrations, context);

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
});
