import { MigrationType, ResolvedMigration } from '../../src/model/types';

export const resolvedMigrations: ResolvedMigration[] = [
    {
        migrate_script: {},
        type: MigrationType.CREATE_INDEX,
        version: 'v1.20.0',
        description: '',
        index_name: 'test',
        physicalLocation: { name: '', ext: '', dir: '', base: '', root: '' }
    },
    {
        migrate_script: {},
        type: MigrationType.CREATE_INDEX,
        version: 'v1.1.0',
        description: '',
        index_name: 'test',
        physicalLocation: { name: '', ext: '', dir: '', base: '', root: '' }
    },
    {
        migrate_script: {},
        type: MigrationType.CREATE_INDEX,
        version: 'v1.1.1',
        description: '',
        index_name: 'test',
        physicalLocation: { name: '', ext: '', dir: '', base: '', root: '' }
    }
];
