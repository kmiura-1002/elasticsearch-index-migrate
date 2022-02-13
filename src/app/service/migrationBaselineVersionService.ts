import * as Config from '@oclif/config';
import * as Parser from '@oclif/parser';
import EsIndex from '../commands/baseline/esindex';
import { readOptions } from '../flags/flagsLoader';
import { cli } from 'cli-ux';
import migrateHistoryRepository from '../domain/migrateHistoryRepository';
import { migrateHistorySpecByIndexName } from '../domain/spec';

export default async function migrationBaselineVersionService(
    parser: <F, A extends { [name: string]: any }>(
        options: Parser.Input<F>,
        argv?: string[]
    ) => Parser.Output<F, A>,
    config: Config.IConfig
) {
    const { flags } = parser(EsIndex);
    const migrationConfig = await readOptions(flags, config);
    const baselineVersion = migrationConfig.migration.baselineVersion;

    const makeBaseline = async () => {
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
