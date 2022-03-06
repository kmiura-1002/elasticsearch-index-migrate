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
        description: Flags.string({
            char: 'd',
            description: 'Description to be saved to history.'
        })
    };

    static args = [...DefaultArgs];

    @createMigrationIndex()
    @migrateLock()
    async run(): Promise<void> {
        const { flags, args } = await this.parse(Index);
        const migrationConfig = await readOptions(flags, this.config);
        const baselineVersion = migrationConfig.migration.baselineVersion;

        await migrationBaselineVersionService(
            args.name,
            flags.description,
            baselineVersion,
            migrationConfig
        ).makeBaseline();
    }

    protected catch(err: Error & { exitCode?: number }): Promise<any> {
        CliUx.ux.error(`throw error. caused by: ${err}`);
        return super.catch(err);
    }
}
