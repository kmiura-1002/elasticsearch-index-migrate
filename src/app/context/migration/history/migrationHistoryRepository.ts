import { MIGRATE_HISTORY_INDEX_NAME } from '../../../types';
import { useElasticsearchClient } from '../../../client/es/ElasticsearchClient';
import { MigrateHistorySpec } from './spec';
import type { ESConfig, MigrationIndex } from '../../../types';
import { MigrationHistoryEntity } from './migrationHistoryEntity';
import { MigrationHistoryId } from '../../base/id/migrationHistoryId';

export function migrationHistoryRepository(connectConf: ESConfig) {
    const { search, postDocument } = useElasticsearchClient(connectConf);

    const findBy = (spec: MigrateHistorySpec) =>
        search<MigrationIndex>(spec.condition).then((value) =>
            value.map((doc) =>
                MigrationHistoryEntity.generate({
                    id: new MigrationHistoryId(doc._id),
                    param: doc._source
                })
            )
        );

    const insert = (entity: MigrationHistoryEntity) =>
        postDocument({
            index: MIGRATE_HISTORY_INDEX_NAME,
            body: {
                index_name: entity.indexName,
                migrate_version: entity.migrateVersion,
                description: entity.description,
                script_name: entity.scriptName,
                script_type: entity.scriptType,
                installed_on: entity.installedOn,
                execution_time: entity.executionTime,
                success: entity.isSuccess,
                checksum: entity.checksum
            }
        });

    return {
        findBy,
        insert
    };
}
