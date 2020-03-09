import StopWatch from '../../utils/stopWatch';
import {
    MAPPING_HISTORY_INDEX_NAME,
    MigrateIndex,
    MigrationInfoContext,
    ResolvedMigration
} from '../../model/types';
import MigrationInfoExecutor from '../info/MigrationInfoExecutor';
import { MigrationInfo } from '../info/MigrationInfo';
import { doValidate } from './MigrationValidate';
import { cli } from 'cli-ux';
import ElasticsearchClient from '../../utils/es/ElasticsearchClient';
import getElasticsearchClient from '../../utils/es/EsUtils';
import { esExecutor, ExecutorFnc } from '../es/esExecutor';
import { formatDateAsIsoString } from '../../utils/makeDetail';

export async function addMigrationHistory(esClient: ElasticsearchClient, history: MigrateIndex) {
    await esClient
        .postDocument(MAPPING_HISTORY_INDEX_NAME, history)
        .then((value) =>
            cli.info(
                `POST Success. Migration history saved successfully. (${JSON.stringify(value)})`
            )
        )
        .catch((reason) =>
            cli.warn(
                `Failed to save history. (Failed Data: ${JSON.stringify(
                    history
                )}, response: ${reason})`
            )
        );
}

export function makeMigrateHistory(
    migrationInfo: MigrationInfo,
    executionTime: number,
    success: boolean
): MigrateIndex {
    return {
        index_name: migrationInfo.resolvedMigration?.index_name ?? '',
        migrate_version: migrationInfo.resolvedMigration?.version ?? '',
        description: migrationInfo.resolvedMigration?.description ?? '',
        script_name: migrationInfo.resolvedMigration?.physicalLocation.base ?? '',
        script_type: migrationInfo.type ?? '',
        installed_on: formatDateAsIsoString(new Date()),
        execution_time: executionTime,
        success
    };
}

/**
 * Run one migration task.
 * @Returns Returns 1 if the migration task was successful.
 */
export async function applyMigration(esClient: ElasticsearchClient, migrationInfo: MigrationInfo) {
    const resolvedMigration = migrationInfo.resolvedMigration;
    if (resolvedMigration) {
        const type = resolvedMigration.type;
        const sw = new StopWatch();
        sw.start();
        const executor = esExecutor.get(type) as ExecutorFnc;
        executor(esClient, resolvedMigration)
            .then(async (value) => {
                if (value.statusCode && value.statusCode >= 400) {
                    await addMigrationHistory(
                        esClient,
                        makeMigrateHistory(migrationInfo, sw.read(), false)
                    );
                    cli.error(
                        `Migration failed. statusCode: ${value.statusCode}, version: ${resolvedMigration.version}`
                    );
                }
            })
            .catch(async (reason) => {
                sw.stop();
                await addMigrationHistory(
                    esClient,
                    makeMigrateHistory(migrationInfo, sw.read(), false)
                );
                cli.error(reason);
            });
        sw.stop();
        await addMigrationHistory(esClient, makeMigrateHistory(migrationInfo, sw.read(), true));
        cli.info(
            `Successfully completed migration of ${
                resolvedMigration?.physicalLocation.base
            }. (time: ${sw.read()} ms)`
        );
        return 1;
    } else {
        cli.warn('No migration target.');
        return 0;
    }
}

export async function migrate(
    resolvedMigrations: ResolvedMigration[],
    appliedMigrations: MigrateIndex[],
    context: MigrationInfoContext
) {
    const migrateInfo = new MigrationInfoExecutor(resolvedMigrations, appliedMigrations, context);
    const esClient = getElasticsearchClient();
    cli.info('Start validate of migration data.');
    const validateErrorMessages = doValidate(migrateInfo);
    if (validateErrorMessages.length > 0) {
        cli.error(`Migration data problem detected:\n${validateErrorMessages.join('\n')}`, {
            code: 'validate_error'
        });
        return;
    }

    cli.info('Start migration!');
    const sw = new StopWatch();
    sw.start();
    const count = await migrateInfo
        .pending()
        .map(async (value) => (await applyMigration(esClient, value)) as number)
        .reduce(
            async (previousValue, currentValue) => (await previousValue) + (await currentValue)
        );

    sw.stop();
    esClient.close();
    cli.info(`Finished migration! (time: ${sw.read()} ms)`);
    return count;
}
