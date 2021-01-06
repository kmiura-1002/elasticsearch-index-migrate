import { ApiResponse, MigrationType, MigrationTypes, ResolvedMigration } from '../../model/types';
import ElasticsearchClient from '../../utils/es/ElasticsearchClient';

export type ExecutorFnc = (
    name: string,
    esClient: ElasticsearchClient,
    resolvedMigration: ResolvedMigration
) => Promise<ApiResponse>;

export const esExecutor: Map<MigrationType, ExecutorFnc> = new Map([
    [
        MigrationTypes.ADD_FIELD,
        (name, esClient, resolvedMigration) =>
            esClient.putMapping({ index: name, body: resolvedMigration?.migrate_script })
    ],
    [
        MigrationTypes.CREATE_INDEX,
        (name, esClient, resolvedMigration) =>
            esClient.createIndex({ index: name, body: resolvedMigration?.migrate_script })
    ],
    [MigrationTypes.DELETE_INDEX, (name, esClient) => esClient.delete(name)],
    [
        MigrationTypes.ALTER_SETTING,
        (name, esClient, resolvedMigration) =>
            esClient.putSetting(name, resolvedMigration?.migrate_script)
    ]
]);
