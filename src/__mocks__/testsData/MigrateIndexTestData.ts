import { MigrationTypes } from '../../app/types';
import type { Document, MigrationIndex } from '../../app/types';

export const migrateIndices = (size?: number): Document<MigrationIndex>[] => {
    if (size) {
        if (size < 0) {
            throw new Error('Size must be greater than zero.');
        }
        Array.from({ length: size }, (_x, i) => ({
            _index: '',
            _type: '',
            _id: '',
            _source: {
                script_name: `v1.0.${i}__add_field.json`,
                migrate_version: `v1.0.${i}`,
                description: 'book index',
                execution_time: 1,
                index_name: 'test',
                installed_on: "2020-01-01'T'00:00:00",
                script_type: MigrationTypes.ADD_FIELD,
                success: true,
                checksum: undefined
            }
        }));
    }
    return [
        {
            _index: '',
            _type: '',
            _id: '',
            _source: {
                script_name: 'v1.0.0__create_index.json',
                migrate_version: 'v1.0.0',
                description: 'book index',
                execution_time: 1,
                index_name: 'test',
                installed_on: "2020-01-01'T'00:00:00",
                script_type: MigrationTypes.CREATE_INDEX,
                success: true,
                checksum: 'mock_checksum'
            }
        },
        {
            _index: '',
            _type: '',
            _id: '',
            _source: {
                script_name: 'v1.0.1__add_field.json',
                migrate_version: 'v1.0.1',
                description: 'book index',
                execution_time: 1,
                index_name: 'test',
                installed_on: "2020-01-01'T'00:00:00",
                script_type: MigrationTypes.ADD_FIELD,
                success: true,
                checksum: 'mock_checksum'
            }
        },
        {
            _index: '',
            _type: '',
            _id: '',
            _source: {
                script_name: 'v1.0.2__add_fieldcopy.json',
                migrate_version: 'v1.0.2',
                description: 'book index',
                execution_time: 1,
                index_name: 'test',
                installed_on: "2020-01-01'T'00:00:00",
                script_type: MigrationTypes.ADD_FIELD,
                success: true,
                checksum: 'mock_checksum'
            }
        }
    ];
};
