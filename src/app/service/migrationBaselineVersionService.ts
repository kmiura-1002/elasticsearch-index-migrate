import migrateHistoryRepository from '../context/migrate_history/migrateHistoryRepository';
import { migrateHistorySpecByIndexName } from '../context/migrate_history/spec';
import { CliUx } from '@oclif/core';
import { DeepRequired } from 'ts-essentials';
import { MigrationConfig } from '../types';

const migrationBaselineVersionService = (
    targetName: string,
    description: string | undefined,
    baselineVersion: {
        [key: string]: string;
    },
    config: DeepRequired<MigrationConfig>
) => {
    const makeBaseline = async () => {
        const { findBy, insert } = migrateHistoryRepository(config.elasticsearch);
        const baseline = baselineVersion[targetName];

        if (baseline === undefined) {
            throw new Error(`The baseline setting for index(${targetName}) does not exist.`);
        }
        const histories = await findBy(migrateHistorySpecByIndexName(targetName, baseline));
        if (histories.length === 0) {
            CliUx.ux.info('Baseline history does not exist.');
            CliUx.ux.info(`Create baseline in ${baseline}.`);

            await insert({
                index_name: targetName,
                migrate_version: baseline,
                description
            });
            CliUx.ux.info(`Successfully created a baseline in ${baseline}.`);
        } else {
            CliUx.ux.info('There is already a baseline history');
        }
    };

    return {
        makeBaseline
    };
};

export default migrationBaselineVersionService;
