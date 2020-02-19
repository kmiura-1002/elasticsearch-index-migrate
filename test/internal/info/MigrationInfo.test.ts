import 'mocha';
import { expect } from 'chai';
import { MigrationInfo } from '../../../src/executor/info/MigrationInfoService';
import { MigrationState, MigrationStateInfo, MigrationType } from '../../../src/model/types';
import { migrationInfoContext } from '../../data/MigrationInfoContextTestData';

describe('MigrationInfo test', () => {
    const testData = [
        {
            context: { ...migrationInfoContext, baseline: 'v1.0.0' },
            outOfOrder: false,
            resolvedMigration: {
                migrate_script: {},
                type: MigrationType.CREATE_INDEX,
                version: 'v0.0.1',
                description: '',
                index_name: 'test',
                physicalLocation: { name: '', ext: '', dir: '', base: '', root: '' }
            },
            appliedMigration: undefined,
            expect: MigrationStateInfo.get(MigrationState.BELOW_BASELINE)
        },
        {
            context: { ...migrationInfoContext, baseline: 'v1.0.0', lastApplied: 'v2.0.0' },
            outOfOrder: true,
            resolvedMigration: {
                migrate_script: {},
                type: MigrationType.CREATE_INDEX,
                version: 'v1.0.1',
                description: '',
                index_name: 'test',
                physicalLocation: { name: '', ext: '', dir: '', base: '', root: '' }
            },
            appliedMigration: undefined,
            expect: MigrationStateInfo.get(MigrationState.IGNORED)
        },
        {
            context: { ...migrationInfoContext, baseline: 'v1.0.0' },
            outOfOrder: false,
            resolvedMigration: {
                migrate_script: {},
                type: MigrationType.CREATE_INDEX,
                version: 'v1.0.0',
                description: '',
                index_name: 'test',
                physicalLocation: { name: '', ext: '', dir: '', base: '', root: '' }
            },
            appliedMigration: undefined,
            expect: MigrationStateInfo.get(MigrationState.PENDING)
        },
        {
            context: { ...migrationInfoContext, baseline: 'v1.0.0' },
            outOfOrder: false,
            resolvedMigration: {
                migrate_script: {},
                type: MigrationType.CREATE_INDEX,
                version: 'v1.0.0',
                description: '',
                index_name: 'test',
                physicalLocation: { name: '', ext: '', dir: '', base: '', root: '' }
            },
            appliedMigration: {
                installedRank: 1,
                version: 'v1.0.0',
                description: '',
                type: MigrationType.BASELINE,
                script: '',
                installedOn: new Date(),
                executionTime: 1,
                success: true
            },
            expect: MigrationStateInfo.get(MigrationState.BASELINE)
        },
        {
            context: { ...migrationInfoContext, baseline: 'v1.0.0', lastResolved: 'v2.0.0' },
            outOfOrder: false,
            resolvedMigration: undefined,
            appliedMigration: {
                installedRank: 1,
                version: 'v1.0.0',
                description: '',
                type: MigrationType.ADD_FIELD,
                script: '',
                installedOn: new Date(),
                executionTime: 1,
                success: true
            },
            expect: MigrationStateInfo.get(MigrationState.MISSING_SUCCESS)
        },
        {
            context: { ...migrationInfoContext, baseline: 'v1.0.0', lastResolved: 'v2.0.0' },
            outOfOrder: false,
            resolvedMigration: undefined,
            appliedMigration: {
                installedRank: 1,
                version: 'v1.0.0',
                description: '',
                type: MigrationType.ADD_FIELD,
                script: '',
                installedOn: new Date(),
                executionTime: 1,
                success: false
            },
            expect: MigrationStateInfo.get(MigrationState.MISSING_FAILED)
        },
        {
            context: { ...migrationInfoContext, baseline: 'v1.0.0', lastResolved: 'v0.0.0' },
            outOfOrder: false,
            resolvedMigration: undefined,
            appliedMigration: {
                installedRank: 1,
                version: 'v1.0.0',
                description: '',
                type: MigrationType.ADD_FIELD,
                script: '',
                installedOn: new Date(),
                executionTime: 1,
                success: true
            },
            expect: MigrationStateInfo.get(MigrationState.FUTURE_SUCCESS)
        },
        {
            context: { ...migrationInfoContext, baseline: 'v1.0.0', lastResolved: 'v0.0.0' },
            outOfOrder: false,
            resolvedMigration: undefined,
            appliedMigration: {
                installedRank: 1,
                version: 'v1.0.0',
                description: '',
                type: MigrationType.ADD_FIELD,
                script: '',
                installedOn: new Date(),
                executionTime: 1,
                success: false
            },
            expect: MigrationStateInfo.get(MigrationState.FUTURE_FAILED)
        },
        {
            context: { ...migrationInfoContext },
            outOfOrder: false,
            resolvedMigration: {
                migrate_script: {},
                type: MigrationType.CREATE_INDEX,
                version: 'v1.0.0',
                description: '',
                index_name: 'test',
                physicalLocation: { name: '', ext: '', dir: '', base: '', root: '' }
            },
            appliedMigration: {
                installedRank: 1,
                version: 'v1.0.0',
                description: '',
                type: MigrationType.ADD_FIELD,
                script: '',
                installedOn: new Date(),
                executionTime: 1,
                success: false
            },
            expect: MigrationStateInfo.get(MigrationState.FAILED)
        },
        {
            context: { ...migrationInfoContext },
            outOfOrder: true,
            resolvedMigration: {
                migrate_script: {},
                type: MigrationType.CREATE_INDEX,
                version: 'v1.0.0',
                description: '',
                index_name: 'test',
                physicalLocation: { name: '', ext: '', dir: '', base: '', root: '' }
            },
            appliedMigration: {
                installedRank: 1,
                version: 'v1.0.0',
                description: '',
                type: MigrationType.ADD_FIELD,
                script: '',
                installedOn: new Date(),
                executionTime: 1,
                success: true
            },
            expect: MigrationStateInfo.get(MigrationState.OUT_OF_ORDER)
        },
        {
            context: { ...migrationInfoContext },
            outOfOrder: false,
            resolvedMigration: {
                migrate_script: {},
                type: MigrationType.CREATE_INDEX,
                version: 'v1.0.0',
                description: '',
                index_name: 'test',
                physicalLocation: { name: '', ext: '', dir: '', base: '', root: '' }
            },
            appliedMigration: {
                installedRank: 1,
                version: 'v1.0.0',
                description: '',
                type: MigrationType.ADD_FIELD,
                script: '',
                installedOn: new Date(),
                executionTime: 1,
                success: true
            },
            expect: MigrationStateInfo.get(MigrationState.SUCCESS)
        }
    ];

    testData.forEach((value) => {
        it(`${value.expect?.status} state test`, () => {
            const migrationInfo = new MigrationInfo(
                value.context,
                value.outOfOrder,
                value.resolvedMigration,
                value.appliedMigration
            );
            expect(migrationInfo.getState()).is.eq(value.expect);
        });
    });
});
