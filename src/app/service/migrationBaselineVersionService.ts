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
        const histories = await findBy(
            migrateHistorySpecByIndexName(flags.index, baselineVersion[flags.index])
        );
        if (histories.length === 0) {
            cli.info('Baseline history does not exist.');
            cli.info(`Create baseline in ${baselineVersion}.`);

            await insert({
                index_name: flags.index,
                migrate_version: baselineVersion[flags.index],
                description: flags.description
            });
            cli.info(`Successfully created a baseline in ${baselineVersion}.`);
        } else {
            cli.info('There is already a baseline history');
        }
    };

    return {
        makeBaseline
    };
}
