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
            esClient.putMapping({
                index: name,
                body: resolvedMigration.migrate_script,
                ...resolvedMigration.query_parameters
            })
    ],
    [
        MigrationTypes.CREATE_INDEX,
        (name, esClient, resolvedMigration) =>
            esClient.createIndex({
                index: name,
                body: resolvedMigration.migrate_script,
                ...resolvedMigration.query_parameters
            })
    ],
    [
        MigrationTypes.DELETE_INDEX,
        (name, esClient, resolvedMigration) =>
            esClient.delete({ index: name, ...resolvedMigration.query_parameters })
    ],
    [
        MigrationTypes.ALTER_SETTING,
        (name, esClient, resolvedMigration) =>
            esClient.putSetting({
                index: name,
                body: resolvedMigration.migrate_script,
                ...resolvedMigration.query_parameters
            })
    ],
    [
        MigrationTypes.CREATE_DOCUMENT,
        async (name, esClient, resolvedMigration) => {
            const data = resolvedMigration.data;
            if (!data) {
                throw { error: '.data is required' };
            }

            const documents = Array.isArray(data) ? data : [data];
            for (const doc of documents) {
                if (!doc.id) {
                    throw {
                        error: `Missing id in document: ${JSON.stringify(doc)}`
                    };
                }

                const data = {
                    id: doc.id,
                    body: doc,
                    index: name,
                    ...resolvedMigration.query_parameters
                };

                await esClient.postDocument(data);
            }

            return Promise.resolve({ statusCode: 200 } as ApiResponse);
        }
    ]
]);
