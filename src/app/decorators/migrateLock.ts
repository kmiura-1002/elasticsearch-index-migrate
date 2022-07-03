import { CliUx, Command } from '@oclif/core';
import { readOptions } from '../config/flags/flagsLoader';
import type { ESConfig, LockIndex } from '../types';
import { MIGRATION_LOCK_INDEX_NAME } from '../types';
import { useElasticsearchClient } from '../client/es/ElasticsearchClient';
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

    // lock
    const id = await makeLock(this.id ?? 'unknown', migrationConfig.elasticsearch);

    // call command
    try {
        await originalRunCommand.apply(this, cmdArgs);
    } catch (e) {
        // No error processing is performed here. Perform error handling with catch in oclif/Command.
        CliUx.ux.debug(`An error occurred in the command. reason:[${e}]`);
    }

    // unlock
    await unlock(id, migrationConfig.elasticsearch);
}

const makeLock = async (commandId: string, esConfig: ESConfig) => {
    try {
        const { exists, search, postDocument, close } = useElasticsearchClient(esConfig);
        const isExistsIndex = await exists({ index: MIGRATION_LOCK_INDEX_NAME });

        if (!isExistsIndex) {
            CliUx.ux.error('Cannot create a lock because the index does not exist.');
        }

        const lockData = (await search<LockIndex>({ index: MIGRATION_LOCK_INDEX_NAME })).map(
            (value) => value._source
        );
        if (lockData.length > 0) {
            await close();
            CliUx.ux.error(
                `Migration is being done by other processes(${lockData.map(
                    (value) =>
                        `lock command:${value.command}, lock time:${format(
                            value.create,
                            "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"
                        )}`
                )}).\nIf the previous process failed and you are left with a lock, remove all documents from the migrate_lock index.`
            );
        }

        const id: string = await postDocument({
            index: MIGRATION_LOCK_INDEX_NAME,
            refresh: 'wait_for',
            body: {
                created: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"),
                command: commandId
            }
        }).then((value) => value._id);

        await close();

        return id;
    } catch (e) {
        CliUx.ux.error(`Lock creation failed.\nreason:[${e}]`);
    }
};

const unlock = async (documentId: string, esConfig: ESConfig) => {
    try {
        const { deleteDocument, close, version } = useElasticsearchClient(esConfig);
        await deleteDocument({
            index: MIGRATION_LOCK_INDEX_NAME,
            refresh: 'wait_for',
            type: version().major === 6 ? '_doc' : undefined,
            id: documentId
        });
        await close();
    } catch (e) {
        CliUx.ux.error(`Unlock failed. Please unlock migrate_lock manually.\nreason:[${e}]`);
    }
};
