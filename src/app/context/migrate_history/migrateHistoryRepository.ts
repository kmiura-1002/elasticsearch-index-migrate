import { MIGRATE_HISTORY_INDEX_NAME } from '../../types';
import { useElasticsearchClient } from '../../client/es/ElasticsearchClient';
import { MigrateHistorySpec } from './spec';
import { format } from 'date-fns';
import type { ESConfig, MigrateIndex } from '../../types';
import { MigrateHistoryEntity } from './migrateHistoryEntity';
import { MigrateHistoryId } from '../base/id';

export function migrateHistoryRepository(connectConf: ESConfig) {
    const { search, postDocument } = useElasticsearchClient(connectConf);

    const findBy = (spec: MigrateHistorySpec) =>
        search<MigrateIndex>(spec.condition).then((value) =>
            value.map((doc) =>
                MigrateHistoryEntity.makeHistory({
                    id: new MigrateHistoryId(doc._id),
                    param: doc._source
                })
            )
        );

    const insert = (param: Partial<MigrateIndex>) =>
        postDocument({
            index: MIGRATE_HISTORY_INDEX_NAME,
            body: {
                index_name: param.index_name,
                migrate_version: param.migrate_version,
                description: param.description ?? 'Migration baseline',
                script_name: param.script_name ?? '',
                script_type: param.script_type ?? '',
                installed_on: param.installed_on ?? format(new Date(), "yyyy-MM-dd'T'HH:mm:ss"),
                execution_time: param.execution_time ?? 0,
                success: param.success ?? true,
                checksum: param.checksum
            }
        });

    return {
        findBy,
        insert
    };
}