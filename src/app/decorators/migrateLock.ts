import { CliUx, Command } from '@oclif/core';
import { readOptions } from '../config/flags/flagsLoader';
import v7Mapping from '../../resources/mapping/migrate_lock_esV7.json';
import v6Mapping from '../../resources/mapping/migrate_lock_esV6.json';
import { MIGRATE_LOCK_INDEX_NAME, MigrationConfig } from '../types';
import { usedEsVersion } from '../client/es/EsUtils';
import useElasticsearchClient from '../client/es/ElasticsearchClient';
import { DeepRequired } from 'ts-essentials';
import { format } from 'date-fns';

export function migrateLock() {
    return function (
        _target: Command,
        _propertyKey: string,
        descriptor: TypedPropertyDescriptor<() => Promise<void>>
    ) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const originalCommand = descriptor.value!;
        descriptor.value = async function (this: Command, ...cmdArgs: unknown[]) {
            await lock.call(this, originalCommand, cmdArgs);
        };
    };
}

async function lock(
    this: Command,
    originalRunCommand: (...args: unknown[]) => Promise<void>,
    cmdArgs: unknown[]
) {
    const { flags } = await this.parse();
    const migrationConfig = await readOptions(flags, this.config);
    let id;

    // lock
    try {
        const { exists, createIndex, postDocument, close } = useElasticsearchClient(
            migrationConfig.elasticsearch
        );
        const isExistsIndex = await exists({ index: MIGRATE_LOCK_INDEX_NAME });

        if (!isExistsIndex) {
            CliUx.ux.info('migrate_lock index does not exist.');
            CliUx.ux.info('Create a migrate_lock index for the first time.');
            const mappingData = getLockIndexRequestBody(migrationConfig);
            const ret = await createIndex({
                index: MIGRATE_LOCK_INDEX_NAME,
                body: mappingData
            });

            if (!ret || ret.statusCode !== 200) {
                CliUx.ux.error('Failed to create index.');
            }

            CliUx.ux.info('The creation of the index has been completed.');
        }

        id = await postDocument({
            index: MIGRATE_LOCK_INDEX_NAME,
            refresh: 'wait_for',
            body: {
                created: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss.SSSxxx")
            }
        }).then((value) => {
            console.log(value.body);
            return value.body._id;
        });

        await close();
    } catch (e) {
        CliUx.ux.error(`Initialization process failed.\nreason:[${e}]`);
    }

    // call command
    await originalRunCommand.apply(this, cmdArgs);

    // unlock
    try {
        const { deleteDocument, close, version } = useElasticsearchClient(
            migrationConfig.elasticsearch
        );
        await deleteDocument({
            index: MIGRATE_LOCK_INDEX_NAME,
            refresh: 'wait_for',
            type: version().major === 6 ? '_doc' : undefined,
            id
        });
        await close();
    } catch (e) {
        CliUx.ux.error(`IUnlock failed. Please unlock migrate_lock manually.\nreason:[${e}]`);
    }
}

function getLockIndexRequestBody(config: DeepRequired<MigrationConfig>) {
    if (config.migration.lockIndexRequestBody) {
        return config.migration.lockIndexRequestBody;
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
