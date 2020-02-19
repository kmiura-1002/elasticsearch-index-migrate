import 'mocha';
import { expect } from 'chai';
import MigrationInfoService from '../../src/executor/info/MigrationInfoService';
import { resolvedMigrations } from '../data/ResolvedMigrationTestData';
import { migrateIndices } from '../data/MigrateIndexTestData';
import { migrationInfoContext } from '../data/MigrationInfoContextTestData';
import makeDetail from '../../src/utils/makeDetail';
import { MigrationState } from '../../src/model/types';
import { format } from 'date-fns';

describe('makeDetail test', () => {
    it('makeDetail test', () => {
        const installedOn = new Date();
        const service = new MigrationInfoService(
            resolvedMigrations,
            migrateIndices(installedOn),
            migrationInfoContext
        );
        service.refresh();
        const migrationInfos = service.all();
        const detail = makeDetail(migrationInfos);
        const status = migrationInfos.map((value) => value.getState()?.status);

        expect(status)
            .to.be.an('array')
            .to.be.include.ordered.members([
                MigrationState.BASELINE,
                MigrationState.IGNORED,
                MigrationState.SUCCESS,
                MigrationState.SUCCESS
            ]);

        expect(detail)
            .to.be.an('array')
            .to.be.deep.include.ordered.members([
                {
                    version: 'v1.0.0',
                    description: '',
                    type: 'BASELINE',
                    installedOn: format(installedOn, 'yyyy/MM/dd HH:mm:ss'),
                    state: 'BASELINE'
                },
                {
                    version: 'v1.1.0',
                    description: '',
                    type: 'CREATE_INDEX',
                    installedOn: '',
                    state: 'IGNORED'
                },
                {
                    version: 'v1.1.1',
                    description: '',
                    type: 'ADD_FIELD',
                    installedOn: format(installedOn, 'yyyy/MM/dd HH:mm:ss'),
                    state: 'SUCCESS'
                },
                {
                    version: 'v1.20.0',
                    description: '',
                    type: 'ADD_FIELD',
                    installedOn: format(installedOn, 'yyyy/MM/dd HH:mm:ss'),
                    state: 'SUCCESS'
                }
            ]);
    });
});
