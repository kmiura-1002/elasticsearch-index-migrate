import StopWatch from '../../utils/stopWatch';
import {
    ESConfig,
    MAPPING_HISTORY_INDEX_NAME,
    MigrateIndex,
    MigrationPlanContext,
    ResolvedMigration
} from '../../model/types';
import MigrationPlanExecutor from '../plan/MigrationPlanExecutor';
import { MigrationPlan } from '../plan/MigrationPlan';
import { doValidate } from './MigrationValidate';
import { cli } from 'cli-ux';
import ElasticsearchClient from '../../utils/es/ElasticsearchClient';
import getElasticsearchClient from '../../utils/es/EsUtils';
import { esExecutor, ExecutorFnc } from '../es/esExecutor';
import { formatDateAsIsoString } from '../../utils/makeDetail';

export async function addMigrationHistory(esClient: ElasticsearchClient, history: MigrateIndex) {
    await esClient
        .postDocument(MAPPING_HISTORY_INDEX_NAME, history)
        .then(() => cli.debug('POST Success. Migration history saved successfully.'))
        .catch((reason) =>
            cli.warn(
                `Failed to save history. (Failed Data: ${JSON.stringify(
                    history
                )}, response: ${reason})`
            )
        );
}

export function makeMigrateHistory(
    migrationPlan: MigrationPlan,
    executionTime: number,
    success: boolean
): MigrateIndex {
    return {
        index_name: migrationPlan.resolvedMigration?.index_name ?? '',
        migrate_version: migrationPlan.resolvedMigration?.version ?? '',
        description: migrationPlan.resolvedMigration?.description ?? '',
        script_name: migrationPlan.resolvedMigration?.physicalLocation.base ?? '',
        script_type: migrationPlan.type ?? '',
        installed_on: formatDateAsIsoString(new Date()),
        execution_time: executionTime,
        success
    };
}

/**
 * Run one migration task.
 * @Returns Returns 1 if the migration task was successful.
 */
export async function applyMigration(esClient: ElasticsearchClient, migrationPlan: MigrationPlan) {
    const resolvedMigration = migrationPlan.resolvedMigration;
    if (resolvedMigration) {
        const type = resolvedMigration.type;
        const sw = new StopWatch();
        sw.start();
        const executor = esExecutor.get(type) as ExecutorFnc;
        await executor(esClient, resolvedMigration)
            .then(async (value) => {
                sw.stop();
                if (value.statusCode && value.statusCode >= 400) {
                    await addMigrationHistory(
                        esClient,
                        makeMigrateHistory(migrationPlan, sw.read(), false)
                    );
                    cli.error(
                        `Migration failed. statusCode: ${value.statusCode}, version: ${resolvedMigration.version}`
                    );
                } else {
                    await addMigrationHistory(
                        esClient,
                        makeMigrateHistory(migrationPlan, sw.read(), true)
                    );
                    cli.info(
                        `Successfully completed migration of ${
                            resolvedMigration?.physicalLocation.base
                        }. (time: ${sw.read()} ms)`
                    );
                }
            })
            .catch(async (reason) => {
                sw.stop();
                await addMigrationHistory(
                    esClient,
                    makeMigrateHistory(migrationPlan, sw.read(), false)
                );
                cli.error(
                    `executor error: val=${JSON.stringify(resolvedMigration)}, reason=${reason}`
                );
            });
        return 1;
    } else {
        cli.warn('No migration target.');
        return 0;
    }
}

export async function migrate(
    resolvedMigrations: ResolvedMigration[],
    appliedMigrations: MigrateIndex[],
    context: MigrationPlanContext,
    esConfig: ESConfig
) {
    const migratePlan = MigrationPlanExecutor(resolvedMigrations, appliedMigrations, context);
    const esClient = getElasticsearchClient(esConfig);
    cli.info('Start validate of migration data.');
    const validateErrorMessages = doValidate(migratePlan);
    if (validateErrorMessages.length > 0) {
        cli.error(`Migration data problem detected:\n${validateErrorMessages.join('\n')}`, {
            code: 'validate_error'
        });
        return;
    }

    cli.info('Start migration!');
    const sw = new StopWatch();
    sw.start();
    let count = 0;
    for (const pending of migratePlan.pending) {
        count += (await applyMigration(esClient, pending)) as number;
    }

    sw.stop();
    esClient.close();
    cli.info(`Finished migration! (time: ${sw.read()} ms)`);
    return count;
}
