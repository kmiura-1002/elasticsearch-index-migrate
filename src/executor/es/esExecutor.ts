import {
    ApiResponse,
    MigrationType,
    MigrationTypes,
    ResolvedMigration,
    ResolvedTemplateMigration
} from '../../model/types';
import ElasticsearchClient from '../../utils/es/ElasticsearchClient';

export type ExecutorFnc = (
    esClient: ElasticsearchClient,
    resolvedMigration: ResolvedMigration | ResolvedTemplateMigration,
    name: string
) => Promise<ApiResponse>;

export const esExecutor: Map<MigrationType, ExecutorFnc> = new Map([
    [
        MigrationTypes.ADD_FIELD,
        (esClient, resolvedMigration, name) =>
            esClient.putMapping(name, resolvedMigration?.migrate_script)
    ],
    [
        MigrationTypes.CREATE_INDEX,
        (esClient, resolvedMigration, name) =>
            esClient.createIndex(name, resolvedMigration?.migrate_script)
    ],
    [
        MigrationTypes.CREATE_OR_UPDATE_INDEX_TEMPLATE,
        (esClient, resolvedMigration, name) =>
            esClient.putTemplate(name, resolvedMigration?.migrate_script)
    ]
]);
