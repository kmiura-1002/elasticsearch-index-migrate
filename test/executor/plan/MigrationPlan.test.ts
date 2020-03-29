import 'mocha';
import { expect } from 'chai';
import { MigrationStateInfo, MigrationStates, MigrationTypes } from '../../../src/model/types';
import { migrationPlanContext } from '../../data/MigrationPlanContextTestData';
import { generateMigrationPlan } from '../../../src/executor/plan/MigrationPlan';

describe('MigrationPlan test', () => {
    const testData = [
        {
            context: { ...migrationPlanContext, baseline: 'v1.0.0' },
            outOfOrder: false,
            resolvedMigration: {
                migrate_script: {},
                type: MigrationTypes.CREATE_INDEX,
                version: 'v0.0.1',
                description: '',
                index_name: 'test',
                physicalLocation: { name: '', ext: '', dir: '', base: '', root: '' }
            },
            appliedMigration: undefined,
            expect: MigrationStateInfo.get(MigrationStates.BELOW_BASELINE)
        },
        {
            context: { ...migrationPlanContext, baseline: 'v1.0.0', lastApplied: 'v2.0.0' },
            outOfOrder: true,
            resolvedMigration: {
                migrate_script: {},
                type: MigrationTypes.CREATE_INDEX,
                version: 'v1.0.1',
                description: '',
                index_name: 'test',
                physicalLocation: { name: '', ext: '', dir: '', base: '', root: '' }
            },
            appliedMigration: undefined,
            expect: MigrationStateInfo.get(MigrationStates.IGNORED)
        },
        {
            context: { ...migrationPlanContext, baseline: 'v1.0.0' },
            outOfOrder: false,
            resolvedMigration: {
                migrate_script: {},
                type: MigrationTypes.CREATE_INDEX,
                version: 'v1.0.0',
                description: '',
                index_name: 'test',
                physicalLocation: { name: '', ext: '', dir: '', base: '', root: '' }
            },
            appliedMigration: undefined,
            expect: MigrationStateInfo.get(MigrationStates.PENDING)
        },
        {
            context: { ...migrationPlanContext, baseline: 'v1.0.0', lastResolved: 'v2.0.0' },
            outOfOrder: false,
            resolvedMigration: undefined,
            appliedMigration: {
                version: 'v1.0.0',
                description: '',
                type: MigrationTypes.ADD_FIELD,
                script: '',
                installedOn: new Date(),
                executionTime: 1,
                success: true
            },
            expect: MigrationStateInfo.get(MigrationStates.MISSING_SUCCESS)
        },
        {
            context: { ...migrationPlanContext, baseline: 'v1.0.0', lastResolved: 'v2.0.0' },
            outOfOrder: false,
            resolvedMigration: undefined,
            appliedMigration: {
                version: 'v1.0.0',
                description: '',
                type: MigrationTypes.ADD_FIELD,
                script: '',
                installedOn: new Date(),
                executionTime: 1,
                success: false
            },
            expect: MigrationStateInfo.get(MigrationStates.MISSING_FAILED)
        },
        {
            context: { ...migrationPlanContext, baseline: 'v1.0.0', lastResolved: 'v0.0.0' },
            outOfOrder: false,
            resolvedMigration: undefined,
            appliedMigration: {
                version: 'v1.0.0',
                description: '',
                type: MigrationTypes.ADD_FIELD,
                script: '',
                installedOn: new Date(),
                executionTime: 1,
                success: true
            },
            expect: MigrationStateInfo.get(MigrationStates.FUTURE_SUCCESS)
        },
        {
            context: { ...migrationPlanContext, baseline: 'v1.0.0', lastResolved: 'v0.0.0' },
            outOfOrder: false,
            resolvedMigration: undefined,
            appliedMigration: {
                version: 'v1.0.0',
                description: '',
                type: MigrationTypes.ADD_FIELD,
                script: '',
                installedOn: new Date(),
                executionTime: 1,
                success: false
            },
            expect: MigrationStateInfo.get(MigrationStates.FUTURE_FAILED)
        },
        {
            context: { ...migrationPlanContext },
            outOfOrder: false,
            resolvedMigration: {
                migrate_script: {},
                type: MigrationTypes.CREATE_INDEX,
                version: 'v1.0.0',
                description: '',
                index_name: 'test',
                physicalLocation: { name: '', ext: '', dir: '', base: '', root: '' }
            },
            appliedMigration: {
                version: 'v1.0.0',
                description: '',
                type: MigrationTypes.ADD_FIELD,
                script: '',
                installedOn: new Date(),
                executionTime: 1,
                success: false
            },
            expect: MigrationStateInfo.get(MigrationStates.FAILED)
        },
        {
            context: { ...migrationPlanContext },
            outOfOrder: true,
            resolvedMigration: {
                migrate_script: {},
                type: MigrationTypes.CREATE_INDEX,
                version: 'v1.0.0',
                description: '',
                index_name: 'test',
                physicalLocation: { name: '', ext: '', dir: '', base: '', root: '' }
            },
            appliedMigration: {
                version: 'v1.0.0',
                description: '',
                type: MigrationTypes.ADD_FIELD,
                script: '',
                installedOn: new Date(),
                executionTime: 1,
                success: true
            },
            expect: MigrationStateInfo.get(MigrationStates.OUT_OF_ORDER)
        },
        {
            context: { ...migrationPlanContext },
            outOfOrder: false,
            resolvedMigration: {
                migrate_script: {},
                type: MigrationTypes.CREATE_INDEX,
                version: 'v1.0.0',
                description: '',
                index_name: 'test',
                physicalLocation: { name: '', ext: '', dir: '', base: '', root: '' }
            },
            appliedMigration: {
                version: 'v1.0.0',
                description: '',
                type: MigrationTypes.ADD_FIELD,
                script: '',
                installedOn: new Date(),
                executionTime: 1,
                success: true
            },
            expect: MigrationStateInfo.get(MigrationStates.SUCCESS)
        }
    ];

    testData.forEach((value) => {
        it(`${value.expect?.status} state test`, () => {
            const migrationPlan = generateMigrationPlan(
                value.context,
                value.outOfOrder,
                value.resolvedMigration,
                value.appliedMigration
            );
            expect(migrationPlan.state).is.eq(value.expect);
        });
    });
});
