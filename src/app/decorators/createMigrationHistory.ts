import { CliUx, Command, Config, Interfaces } from '@oclif/core';
import v7HistoryMapping from '../../resources/mapping/migrate_history_esV7.json';
import v6HistoryMapping from '../../resources/mapping/migrate_history_esV6.json';
import v7LockMapping from '../../resources/mapping/migrate_lock_esV7.json';
import v6LockMapping from '../../resources/mapping/migrate_lock_esV6.json';
import type { MigrationConfig } from '../types';
import { MIGRATE_HISTORY_INDEX_NAME, MIGRATION_LOCK_INDEX_NAME } from '../types';
import { usedEsVersion } from '../client/es/EsUtils';
import { useElasticsearchClient } from '../client/es/ElasticsearchClient';
import { toolConfigRepository } from '../context/config_domain/toolConfigRepository';
import { ToolConfigSpec } from '../context/config_domain/spec';

export function createMigrationHistory() {
    return function (
        _target: Command,
        _propertyKey: string,
        descriptor: TypedPropertyDescriptor<() => Promise<void>>
    ) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const originalCommand = descriptor.value!;
        descriptor.value = async function (this: Command, ...cmdArgs: unknown[]) {
            await setUpCommand.call(this, originalCommand, cmdArgs);
        };
    };
}
async function setUpCommand(
    this: Command,
    originalRunCommand: (...args: unknown[]) => Promise<void>,
    cmdArgs: unknown[]
) {
    const { flags } = await this.parse();
    await setupMigrationEnv(this.config, flags as Interfaces.FlagInput<any>);

    await originalRunCommand.apply(this, cmdArgs);
}

const setupMigrationEnv = async function (config: Config, flags: Interfaces.FlagInput<any>) {
    try {
        const { findBy } = toolConfigRepository();
        const configEntity = await findBy(new ToolConfigSpec(flags, config));
        const { exists, createIndex, close } = useElasticsearchClient(
            configEntity.elasticsearchConfig
        );

        if (!(await exists({ index: MIGRATE_HISTORY_INDEX_NAME }))) {
            CliUx.ux.info(`${MIGRATE_HISTORY_INDEX_NAME} index does not exist.`);
            CliUx.ux.info(`Create a ${MIGRATE_HISTORY_INDEX_NAME} index for the first time.`);
            const mappingData = getHistoryIndexRequestBody(configEntity.allMigrationConfig);
            const ret = await createIndex({
                index: MIGRATE_HISTORY_INDEX_NAME,
                body: mappingData
            });

            if (!ret || !ret.acknowledged) {
                CliUx.ux.error('Failed to create history index.');
            }
            CliUx.ux.info('The creation of the index has been completed.');
        }

        if (!(await exists({ index: MIGRATION_LOCK_INDEX_NAME }))) {
            CliUx.ux.info(`${MIGRATION_LOCK_INDEX_NAME} index does not exist.`);
            CliUx.ux.info(`Create a ${MIGRATION_LOCK_INDEX_NAME} index for the first time.`);
            const mappingData = getLockIndexRequestBody(configEntity.allMigrationConfig);
            const ret = await createIndex({
                index: MIGRATION_LOCK_INDEX_NAME,
                body: mappingData
            });

            if (!ret || !ret.acknowledged) {
                CliUx.ux.error('Failed to create lock index.');
            }

            CliUx.ux.info('The creation of the index has been completed.');
        }
        await close();
    } catch (e) {
        CliUx.ux.error(
            `Initialization process failed.\nreason:[${e instanceof Error ? e : JSON.stringify(e)}]`
        );
    }
};

function getHistoryIndexRequestBody(config: Required<MigrationConfig>) {
    if (config.migration.historyIndexRequestBody) {
        return config.migration.historyIndexRequestBody;
    }
    const esVersion = usedEsVersion({
        version: config.elasticsearch.version,
        searchEngine: config.elasticsearch.searchEngine
    });

    if (esVersion.engine === 'OpenSearch') {
        return v7HistoryMapping;
    } else {
        return esVersion.major === 7 ? v7HistoryMapping : v6HistoryMapping;
    }
}

function getLockIndexRequestBody(config: Required<MigrationConfig>) {
    if (config.migration.lockIndexRequestBody) {
        return config.migration.lockIndexRequestBody;
    }
    const esVersion = usedEsVersion({
        version: config.elasticsearch.version,
        searchEngine: config.elasticsearch.searchEngine
    });

    if (esVersion.engine === 'OpenSearch') {
        return v7LockMapping;
    } else {
        return esVersion.major === 7 ? v7LockMapping : v6LockMapping;
    }
}
