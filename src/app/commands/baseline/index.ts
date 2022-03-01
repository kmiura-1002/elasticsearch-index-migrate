import { CliUx, Command, Flags } from '@oclif/core';
import { createMigrationIndex } from '../../decorators/createMigrationIndex';
import { DefaultFlags, esConnectionFlags } from '../../config/flags/defaultCommandFlags';
import migrationBaselineVersionService from '../../service/migrationBaselineVersionService';
import { DefaultArgs } from '../../config/args/defaultCommandArgs';
import { migrateLock } from '../../decorators/migrateLock';
import { readOptions } from '../../config/flags/flagsLoader';

export default class Index extends Command {
    static description =
        'Create a baseline in migration_history if you were running Elasticsearch before the tool was implemented.';
    static flags = {
        ...esConnectionFlags,
        ...DefaultFlags,
        // index: Flags.string({
        //     char: 'i',
        //     description:
        //         'migration index name.\nThe index flags will be removed in the next version. Please use the arguments (name) instead of this flags.',
        //     required: false
        // }),
        description: Flags.string({
            char: 'd',
            description: 'Description to be saved to history.'
        })
    };

    static args = [...DefaultArgs];

    @createMigrationIndex()
    @migrateLock()
    async run(): Promise<void> {
        try {
            const { flags, args } = await this.parse(Index);
            const migrationConfig = await readOptions(flags, this.config);
            const baselineVersion = migrationConfig.migration.baselineVersion;

            await migrationBaselineVersionService(
                args.name,
                flags.description,
                baselineVersion,
                migrationConfig
            ).makeBaseline();
        } catch (e) {
            CliUx.ux.error(`throw error. caused by: ${e}`);
        }
    }
}
