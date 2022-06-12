import { migrateHistoryRepository } from '../context/migration/history/migrateHistoryRepository';
import { migrateHistorySpecByIndexName } from '../context/migration/history/spec';
import { CliUx } from '@oclif/core';
import type { MigrationConfig } from '../types';
import { MigrateHistoryEntity } from '../context/migration/history/migrateHistoryEntity';

export const migrationBaselineVersionService = (
    targetName: string,
    description: string,
    config: Required<MigrationConfig>
) => {
    const makeBaseline = async () => {
        const { findBy, insert } = migrateHistoryRepository(config.elasticsearch);
        const baseline = config.migration.baselineVersion[targetName];

        if (baseline === undefined) {
            throw new Error(`The baseline setting for index(${targetName}) does not exist.`);
        }
        const histories = await findBy(migrateHistorySpecByIndexName(targetName, baseline));
        if (histories.length === 0) {
            CliUx.ux.info('Baseline history does not exist.');
            CliUx.ux.info(`Create baseline in ${baseline}.`);
            await insert(
                MigrateHistoryEntity.generateBaseline({
                    baselineIndexName: targetName,
                    baseline,
                    description
                })
            );
            CliUx.ux.info(`Successfully created a baseline in ${baseline}.`);
        } else {
            CliUx.ux.info('There is already a baseline history');
        }
    };

    return {
        makeBaseline
    };
};
