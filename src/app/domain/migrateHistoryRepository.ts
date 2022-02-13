import { ESConfig, MIGRATE_HISTORY_INDEX_NAME, MigrateIndex } from '../types';
import useElasticsearchClient from '../client/es/ElasticsearchClient';
import { migrateHistorySpec } from './spec';
import { format } from 'date-fns';

export default function migrateHistoryRepository(connectConf: ESConfig) {
    const { search, postDocument } = useElasticsearchClient(connectConf);

    const findBy = (spec: migrateHistorySpec) => search<MigrateIndex>(spec.condition);

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
