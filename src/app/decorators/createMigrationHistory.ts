import { CliUx, Command, Config, Interfaces } from '@oclif/core';
import { readOptions } from '../flags/flagsLoader';
import v7Mapping from '../../resources/mapping/migrate_history_esV7.json';
import v6Mapping from '../../resources/mapping/migrate_history_esV6.json';
import { MIGRATE_HISTORY_INDEX_NAME, MigrationConfig } from '../types';
import { usedEsVersion } from '../client/es/EsUtils';
import useElasticsearchClient from '../client/es/ElasticsearchClient';
import { DeepRequired } from 'ts-essentials';

export function CreateMigrationHistoryIfNotExists() {
    return function (
        _target: Command,
        _propertyKey: string,
        descriptor: TypedPropertyDescriptor<() => Promise<void>>
    ) {
        const originalCommand = descriptor.value;
        descriptor.value = async function (this: Command) {
            await setUpCommand.call(this, originalCommand ?? Promise.reject);
        };
    };
}
async function setUpCommand(this: Command, originalRunCommand: () => Promise<void>) {
    const { flags } = await this.parse();
    await setUpMigrationEnv({
        config: this.config,
        flags: flags as Interfaces.FlagInput<any>
    });

    await originalRunCommand.apply(this);
}

type SetUpMigrationEnvOptions = {
    config: Config;
    flags: Interfaces.FlagInput<any>;
};

const setUpMigrationEnv = async function (options: SetUpMigrationEnvOptions) {
    const migrationConfig = await readOptions(options.flags, options.config);
    const { exists, createIndex } = useElasticsearchClient(migrationConfig.elasticsearch);
    const isExistsIndex = await exists({ index: MIGRATE_HISTORY_INDEX_NAME }).catch((reason) =>
        CliUx.ux.error(
            `ConnectionError:Check your elasticsearch connection config.\nreason:[${reason}]`
        )
    );

    if (!isExistsIndex) {
        CliUx.ux.info('migrate_history index does not exist.');
        CliUx.ux.info('Create a migrate_history index for the first time.');
        const mappingData = getHistoryIndexRequestBody(migrationConfig);
        const ret = await createIndex({
            index: MIGRATE_HISTORY_INDEX_NAME,
            body: mappingData
        }).catch((reason) => {
            CliUx.ux.error(`Failed to create index.\nreason:[${JSON.stringify(reason)}]`, {
                exit: 1
            });
        });
        if (!ret || ret.statusCode !== 200) {
            CliUx.ux.error('Failed to create index for migrate.', { exit: 1 });
        }

        CliUx.ux.info('The creation of the index has been completed.');
    }
};

function getHistoryIndexRequestBody(config: DeepRequired<MigrationConfig>) {
    if (config.migration.historyIndexRequestBody) {
        return config.migration.historyIndexRequestBody;
    }
    const esVersion = usedEsVersion({
        version: config.elasticsearch.version,
        searchEngine: config.elasticsearch.searchEngine
    });

    if (esVersion.engine === 'OpenSearch') {
        return v7Mapping;
    } else {
        return esVersion.major === 7 ? v7Mapping : v6Mapping;
    }
}
