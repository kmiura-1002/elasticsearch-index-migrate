import type Command from '@oclif/command';
import { IConfig } from '@oclif/config';
import { Input } from '@oclif/command/lib/flags';
import { readOptions } from '../flags/flagsLoader';
import { cli } from 'cli-ux';
import v7Mapping from '../resources/mapping/migrate_history_esV7.json';
import v6Mapping from '../resources/mapping/migrate_history_esV6.json';
import { MAPPING_HISTORY_INDEX_NAME, MigrationConfig } from '../types';
import getElasticsearchClient, { usedEsVersion } from '../client/es/EsUtils';
import ElasticsearchClient from '../client/es/ElasticsearchClient';

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
    const { flags } = this.parse();
    await setUpMigrationEnv({
        config: this.config,
        flags: flags as Input<any>
    });

    await originalRunCommand.apply(this);
}

type SetUpMigrationEnvOptions = {
    config: IConfig;
    flags: Input<any>;
};

const setUpMigrationEnv = async function (options: SetUpMigrationEnvOptions) {
    const migrationConfig = await readOptions(options.flags, options.config);
    const elasticsearchClient = getElasticsearchClient(migrationConfig.elasticsearch);
    const exists = await elasticsearchClient
        .exists({ index: MAPPING_HISTORY_INDEX_NAME })
        .catch((reason) =>
            cli.error(
                `ConnectionError:Check your elasticsearch connection config.\nreason:[${reason}]`
            )
        );

    if (!exists) {
        cli.info('migrate_history index does not exist.');
        cli.info('Create a migrate_history index for the first time.');
        await createHistoryIndex(elasticsearchClient, migrationConfig);
        cli.info('The creation of the index has been completed.');
    }
};

async function createHistoryIndex(
    esClient: ElasticsearchClient,
    config: MigrationConfig
): Promise<void> {
    const mappingData = getHistoryIndexRequestBody(config);
    const ret = await esClient
        .createIndex({ index: MAPPING_HISTORY_INDEX_NAME, body: mappingData })
        .catch((reason) => {
            cli.error(`Failed to create index.\nreason:[${JSON.stringify(reason)}]`, { exit: 1 });
        });
    if (!ret || ret.statusCode !== 200) {
        cli.error('Failed to create index for migrate.', { exit: 1 });
    }
}

function getHistoryIndexRequestBody(config: MigrationConfig) {
    if (config.migration.historyIndexRequestBody) {
        return config.migration.historyIndexRequestBody;
    }
    const esVersion = usedEsVersion(config.elasticsearch.version);

    if (esVersion?.engine === 'OpenSearch') {
        return v7Mapping;
    } else {
        return esVersion?.major === 7 ? v7Mapping : v6Mapping;
    }
}
