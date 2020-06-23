import { ApiResponse, MigrationType, MigrationTypes, ResolvedMigration } from '../../model/types';
import ElasticsearchClient from '../../utils/es/ElasticsearchClient';

export type ExecutorFnc = (
    esClient: ElasticsearchClient,
    resolvedMigration: ResolvedMigration
) => Promise<ApiResponse>;

export const esExecutor: Map<MigrationType, ExecutorFnc> = new Map([
    [
        MigrationTypes.ADD_FIELD,
        (esClient, resolvedMigration) =>
            esClient.putMapping(resolvedMigration.index_name, resolvedMigration?.migrate_script)
    ],
    [
        MigrationTypes.CREATE_INDEX,
        (esClient, resolvedMigration) =>
            esClient.createIndex(resolvedMigration.index_name, resolvedMigration?.migrate_script)
    ],
    [
        MigrationTypes.INDEX_TEMPLATE,
        (esClient, resolvedMigration) =>
            esClient.putTemplate({ ...resolvedMigration?.migrate_script })
    ]
]);
