import { MigrateIndex, MigrationType } from '../../src/model/types';

export const migrateIndices: MigrateIndex[] = [
    {
        installed_rank: 1,
        script_name: 'v1.0.0__test',
        migrate_version: 'v1.0.0',
        description: '',
        execution_time: 1,
        index_name: 'test',
        installed_on: new Date(),
        script_type: MigrationType.BASELINE,
        success: true
    },
    {
        installed_rank: 1,
        script_name: 'v1.0.0__test',
        migrate_version: 'v1.1.1',
        description: '',
        execution_time: 1,
        index_name: 'test',
        installed_on: new Date(),
        script_type: MigrationType.MAPPING,
        success: true
    },
    {
        installed_rank: 1,
        script_name: 'v1.0.0__test',
        migrate_version: 'v1.20.0',
        description: '',
        execution_time: 1,
        index_name: 'test',
        installed_on: new Date(),
        script_type: MigrationType.MAPPING,
        success: true
    }
];
