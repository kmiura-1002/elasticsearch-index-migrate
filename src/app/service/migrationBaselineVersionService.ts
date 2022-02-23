import * as Config from '@oclif/core';
import { readOptions } from '../flags/flagsLoader';
import migrateHistoryRepository from '../context/migrate-history/migrateHistoryRepository';
import { migrateHistorySpecByIndexName } from '../context/migrate-history/spec';
import { CliUx } from '@oclif/core';

const migrationBaselineVersionService = (flags: { [name: string]: any }, config: Config.Config) => {
    const readConfig = async () => {
        const migrationConfig = await readOptions(flags, config);
        const baselineVersion = migrationConfig.migration.baselineVersion;

        return {
            migrationConfig,
            baselineVersion
        };
    };

    const getTargetName = (flags: { [name: string]: any }) => {
        if (flags.index) {
            return flags.index;
        }
        if (flags.name) {
            return flags.name;
        }
        throw new Error('Migration target is unknown.');
    };

    const makeBaseline = async () => {
        const { migrationConfig, baselineVersion } = await readConfig();
        const { findBy, insert } = migrateHistoryRepository(migrationConfig.elasticsearch);
        const targetName = getTargetName(flags);
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
                description: flags.description
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
