import { MIGRATE_HISTORY_INDEX_NAME } from '../../types';
import { useElasticsearchClient } from '../../client/es/ElasticsearchClient';
import { MigrateHistorySpec } from './spec';
import type { ESConfig, MigrateIndex } from '../../types';
import { MigrateHistoryEntity } from './migrateHistoryEntity';
import { MigrateHistoryId } from '../base/id/migrateHistoryId';

export function migrateHistoryRepository(connectConf: ESConfig) {
    const { search, postDocument } = useElasticsearchClient(connectConf);

    const findBy = (spec: MigrateHistorySpec) =>
        search<MigrateIndex>(spec.condition).then((value) =>
            value.map((doc) =>
                MigrateHistoryEntity.generate({
                    id: new MigrateHistoryId(doc._id),
                    param: doc._source
                })
            )
        );

    const insert = (entity: MigrateHistoryEntity) =>
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
