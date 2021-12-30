import { MigrationTypes, ResolvedMigration } from '../../types';

export const resolvedMigrations: ResolvedMigration[] = [
    {
        migrate_script: {},
        type: MigrationTypes.CREATE_INDEX,
        version: 'v1.20.0',
        description: '',
        physicalLocation: { name: '', ext: '', dir: '', base: '', root: '' }
    },
    {
        migrate_script: {},
        type: MigrationTypes.CREATE_INDEX,
        version: 'v1.1.0',
        description: '',
        physicalLocation: { name: '', ext: '', dir: '', base: '', root: '' }
    },
    {
        migrate_script: {},
        type: MigrationTypes.CREATE_INDEX,
        version: 'v1.1.1',
        description: '',
        physicalLocation: { name: '', ext: '', dir: '', base: '', root: '' }
    },
    {
        migrate_script: {},
        type: MigrationTypes.CREATE_INDEX,
        version: 'v99.1.1',
        description: '',
        physicalLocation: { name: '', ext: '', dir: '', base: '', root: '' }
    }
];
