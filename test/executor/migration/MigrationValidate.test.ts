import 'mocha';
import { expect } from 'chai';
import {
    doValidate,
    migrationPlanValidate
} from '../../../src/executor/migration/MigrationValidate';
import { MigrationStateInfo, MigrationStates, MigrationTypes } from '../../../src/model/types';
import { migrationPlanContext } from '../../data/MigrationPlanContextTestData';
import MigrationPlanExecutor from '../../../src/executor/plan/MigrationPlanExecutor';
import { resolvedMigrations } from '../../data/ResolvedMigrationTestData';
import { migrateIndices } from '../../data/MigrateIndexTestData';
import { format } from 'date-fns';

describe('MigrationValidation test', () => {
    it('Unknown version', () => {
        expect(
            migrationPlanValidate({
                resolvedMigration: {
                    type: MigrationTypes.ADD_FIELD,
                    index_name: 'test',
                    version: '',
                    description: '',
                    physicalLocation: {
                        name: '',
                        base: '',
                        dir: '',
                        ext: '',
                        root: ''
                    },
                    migrate_script: {}
                },
                context: migrationPlanContext,
                outOfOrder: false,
                baseline: false
            })
        ).is.eq('Unknown version migration detected');
        expect(
            migrationPlanValidate({
                appliedMigration: {
                    version: '',
                    description: '',
                    type: MigrationTypes.ADD_FIELD,
                    script: '',
                    installedOn: new Date(),
                    executionTime: 0,
                    success: true
                },
                context: migrationPlanContext,
                outOfOrder: false,
                baseline: false
            })
        ).is.eq('Unknown version migration detected');
        expect(
            migrationPlanValidate({
                context: migrationPlanContext,
                outOfOrder: false,
                baseline: false
            })
        ).is.eq('Unknown version migration detected');
    });

    it('ignore state validation', () => {
        const ret = migrationPlanValidate({
            resolvedMigration: {
                type: MigrationTypes.ADD_FIELD,
                index_name: 'test',
                version: 'v1.0.1',
                description: '',
                physicalLocation: {
                    name: '',
                    base: '',
                    dir: '',
                    ext: '',
                    root: ''
                },
                migrate_script: {}
            },
            state: MigrationStateInfo.get(MigrationStates.IGNORED),
            context: migrationPlanContext,
            outOfOrder: false,
            baseline: false
        });

        expect(ret).is.include('Resolved migrations detected have not been applied to the index');
    });

    it('failed state validation', () => {
        const ret = migrationPlanValidate({
            resolvedMigration: {
                type: MigrationTypes.ADD_FIELD,
                index_name: 'test',
                version: 'v1.0.1',
                description: '',
                physicalLocation: {
                    name: '',
                    base: '',
                    dir: '',
                    ext: '',
                    root: ''
                },
                migrate_script: {}
            },
            state: MigrationStateInfo.get(MigrationStates.FAILED),
            context: migrationPlanContext,
            outOfOrder: false,
            baseline: false
        });

        expect(ret).is.include('Failed migration to version');
    });

    it('Applied migration detected not resolved locally validation', () => {
        const ret = migrationPlanValidate({
            appliedMigration: {
                version: 'v1.0.1',
                description: '',
                type: MigrationTypes.ADD_FIELD,
                script: '',
                installedOn: new Date(),
                executionTime: 0,
                success: true
            },
            state: MigrationStateInfo.get(MigrationStates.SUCCESS),
            context: migrationPlanContext,
            outOfOrder: false,
            baseline: false
        });

        expect(ret).is.include('Applied migration detected not resolved locally');
    });

    it('Migration type mismatch validation', () => {
        const ret = migrationPlanValidate({
            appliedMigration: {
                version: 'v1.0.1',
                description: '',
                type: MigrationTypes.ADD_FIELD,
                script: '',
                installedOn: new Date(),
                executionTime: 0,
                success: true
            },
            resolvedMigration: {
                type: MigrationTypes.CREATE_INDEX,
                index_name: 'test',
                version: 'v1.0.1',
                description: '',
                physicalLocation: {
                    name: '',
                    base: '',
                    dir: '',
                    ext: '',
                    root: ''
                },
                migrate_script: {}
            },
            state: MigrationStateInfo.get(MigrationStates.SUCCESS),
            context: migrationPlanContext,
            outOfOrder: false,
            baseline: false
        });

        expect(ret).is.include('Migration type mismatch for migration');
    });
    it('No validation errors', () => {
        const executor = MigrationPlanExecutor(
            [
                {
                    migrate_script: {},
                    type: MigrationTypes.CREATE_INDEX,
                    version: 'v1.20.0',
                    description: '',
                    index_name: 'test',
                    physicalLocation: { name: '', ext: '', dir: '', base: '', root: '' }
                }
            ],
            [
                {
                    script_name: 'v1.0.0__test',
                    migrate_version: 'v1.20.0',
                    description: '',
                    execution_time: 1,
                    index_name: 'test',
                    installed_on: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
                    script_type: MigrationTypes.CREATE_INDEX,
                    success: true
                }
            ],
            migrationPlanContext
        );
        const ret = doValidate(executor);

        expect(ret).is.an('array').lengthOf(0);
    });

    it('validation errors', () => {
        const executor = MigrationPlanExecutor(
            resolvedMigrations,
            migrateIndices(new Date()),
            migrationPlanContext
        );
        const ret = doValidate(executor);
        expect(ret)
            .is.an('array')
            .lengthOf(4)
            .deep.include.ordered.members([
                'Resolved migrations detected have not been applied to the index (v1.1.0)',
                'Migration type mismatch for migration v1.1.1',
                'Failed migration to version v1.10.2() detected',
                'Migration type mismatch for migration v1.20.0'
            ]);
    });
});
