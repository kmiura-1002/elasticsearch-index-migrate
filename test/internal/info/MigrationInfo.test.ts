import 'mocha';
import { expect } from 'chai';
import { MigrationInfoImpl } from '../../../src/internal/info/MigrationInfoService';
import { MigrationScriptType, MigrationState, MigrationStateInfo } from '../../../src/model/types';
import { migrationInfoContext } from '../../data/MigrationInfoContextTestData';

describe('MigrationInfo test', () => {
    const testData = [
        {
            context: { ...migrationInfoContext, baseline: 'v1.0.0' },
            outOfOrder: false,
            appliedMigration: {
                migrate_script: {},
                type: MigrationScriptType.CREATE_INDEX,
                version: 'v0.0.1',
                description: '',
                index_name: 'test',
                physicalLocation: { name: '', ext: '', dir: '', base: '', root: '' }
            },
            resolvedMigration: undefined,
            expect: MigrationStateInfo.get(MigrationState.BELOW_BASELINE)
        },
        {
            context: { ...migrationInfoContext, baseline: 'v1.0.0' },
            outOfOrder: true,
            appliedMigration: {
                migrate_script: {},
                type: MigrationScriptType.CREATE_INDEX,
                version: 'v1.0.1',
                description: '',
                index_name: 'test',
                physicalLocation: { name: '', ext: '', dir: '', base: '', root: '' }
            },
            resolvedMigration: undefined,
            expect: MigrationStateInfo.get(MigrationState.IGNORED)
        },
        {
            context: { ...migrationInfoContext, baseline: 'v1.0.0' },
            outOfOrder: false,
            appliedMigration: {
                migrate_script: {},
                type: MigrationScriptType.CREATE_INDEX,
                version: 'v1.0.0',
                description: '',
                index_name: 'test',
                physicalLocation: { name: '', ext: '', dir: '', base: '', root: '' }
            },
            resolvedMigration: undefined,
            expect: MigrationStateInfo.get(MigrationState.PENDING)
        }
    ];

    testData.forEach((value) => {
        it(`${value.expect?.status} state test`, () => {
            const migrationInfo = new MigrationInfoImpl(
                value.context,
                value.outOfOrder,
                value.appliedMigration
            );
            expect(migrationInfo.getState()).is.eq(value.expect);
        });
    });
});
