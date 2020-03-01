import { ApiResponse, MigrationType, ResolvedMigration } from '../../model/types';
import ElasticsearchClient from '../../utils/es/ElasticsearchClient';

export type ExecutorFnc = (
    esClient: ElasticsearchClient,
    resolvedMigration: ResolvedMigration
) => Promise<ApiResponse>;

export const esExecutor: Map<MigrationType, ExecutorFnc> = new Map([
    [
        MigrationType.ADD_FIELD,
        (esClient, resolvedMigration) =>
            esClient.putMapping(resolvedMigration.index_name, resolvedMigration?.migrate_script)
    ],
    [
        MigrationType.CREATE_INDEX,
        (esClient, resolvedMigration) =>
            esClient.createIndex(resolvedMigration.index_name, resolvedMigration?.migrate_script)
    ]
]);
