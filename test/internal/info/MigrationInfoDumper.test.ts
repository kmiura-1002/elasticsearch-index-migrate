import 'mocha';
import { expect } from 'chai';
import MigrationInfoService from '../../../src/internal/info/MigrationInfoService';
import { resolvedMigrations } from '../../data/ResolvedMigrationTestData';
import { migrateIndices } from '../../data/MigrateIndexTestData';
import { migrationInfoContext } from '../../data/MigrationInfoContextTestData';
import dump from '../../../src/internal/info/MigrationInfoDumper';
import { MigrationState } from '../../../src/model/types';
import { format } from 'date-fns';

describe('MigrationInfoDumper test', () => {
    it('dump test', () => {
        const installedOn = new Date();
        const service = new MigrationInfoService(
            resolvedMigrations,
            migrateIndices(installedOn),
            migrationInfoContext
        );
        service.refresh();
        const migrationInfos = service.all();
        const dumpColumns = dump(migrationInfos);
        const status = migrationInfos.map((value) => value.getState()?.status);

        expect(status)
            .to.be.an('array')
            .to.be.include.ordered.members([
                MigrationState.BASELINE,
                MigrationState.IGNORED,
                MigrationState.SUCCESS,
                MigrationState.SUCCESS
            ]);

        expect(dumpColumns)
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
