import * as Config from '@oclif/core';
import { readOptions } from '../flags/flagsLoader';
import { cli } from 'cli-ux';
import migrateHistoryRepository from '../context/migrate-history/migrateHistoryRepository';
import { migrateHistorySpecByIndexName } from '../context/migrate-history/spec';

export default function migrationBaselineVersionService(
    flags: { [name: string]: any },
    config: Config.Config
) {
    const readConfig = async () => {
        const migrationConfig = await readOptions(flags, config);
        const baselineVersion = migrationConfig.migration.baselineVersion;

        return {
            migrationConfig,
            baselineVersion
        };
    };

    const makeBaseline = async () => {
        const { migrationConfig, baselineVersion } = await readConfig();
        const { findBy, insert } = migrateHistoryRepository(migrationConfig.elasticsearch);
        const baseline = baselineVersion[flags.index];
        const histories = await findBy(migrateHistorySpecByIndexName(flags.index, baseline));
        if (histories.length === 0) {
            cli.info('Baseline history does not exist.');
            cli.info(`Create baseline in ${baseline}.`);

            await insert({
                index_name: flags.index,
                migrate_version: baseline,
                description: flags.description
            });
            cli.info(`Successfully created a baseline in ${baseline}.`);
        } else {
            cli.info('There is already a baseline history');
        }
    };

    return {
        makeBaseline
    };
}
