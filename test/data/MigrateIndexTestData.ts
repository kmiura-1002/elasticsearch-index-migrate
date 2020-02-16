import { MigrateIndex, MigrationType } from '../../src/model/types';
import { format } from 'date-fns';

export const migrateIndices = (installed_on: Date): MigrateIndex[] => [
    {
        installed_rank: 1,
        script_name: 'v1.0.0__test',
        migrate_version: 'v1.0.0',
        description: '',
        execution_time: 1,
        index_name: 'test',
        installed_on: format(installed_on, 'yyyy/MM/dd HH:mm:ss'),
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
        installed_on: format(installed_on, 'yyyy/MM/dd HH:mm:ss'),
        script_type: MigrationType.ADD_FIELD,
        success: true
    },
    {
        installed_rank: 1,
        script_name: 'v1.0.0__test',
        migrate_version: 'v1.20.0',
        description: '',
        execution_time: 1,
        index_name: 'test',
        installed_on: format(installed_on, 'yyyy/MM/dd HH:mm:ss'),
        script_type: MigrationType.ADD_FIELD,
        success: true
    }
];
