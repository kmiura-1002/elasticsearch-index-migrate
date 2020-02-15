import { AppliedMigration, MigrationScriptType } from '../../src/model/types';

export const appliedMigrations: AppliedMigration[] = [
    {
        migrate_script: {},
        type: MigrationScriptType.CREATE_INDEX,
        version: 'v1.20.0',
        description: '',
        index_name: 'test',
        physicalLocation: { name: '', ext: '', dir: '', base: '', root: '' }
    },
    {
        migrate_script: {},
        type: MigrationScriptType.CREATE_INDEX,
        version: 'v1.1.0',
        description: '',
        index_name: 'test',
        physicalLocation: { name: '', ext: '', dir: '', base: '', root: '' }
    },
    {
        migrate_script: {},
        type: MigrationScriptType.CREATE_INDEX,
        version: 'v1.1.1',
        description: '',
        index_name: 'test',
        physicalLocation: { name: '', ext: '', dir: '', base: '', root: '' }
    }
];
