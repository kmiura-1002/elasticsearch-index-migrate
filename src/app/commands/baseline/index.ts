import { CliUx, Command, Flags } from '@oclif/core';
import { createMigrationHistory } from '../../decorators/createMigrationHistory';
import { DefaultFlags, esConnectionFlags } from '../../config/flags/defaultCommandFlags';
import { migrationBaselineVersionService } from '../../service/migrationBaselineVersionService';
import { DefaultArgs } from '../../config/args/defaultCommandArgs';
import { migrateLock } from '../../decorators/migrateLock';
import { ToolConfigSpec } from '../../context/config_domain/spec';
import { toolConfigRepository } from '../../context/config_domain/toolConfigRepository';

export default class Index extends Command {
    static description =
        'Create a baseline in migration_history if you were running Elasticsearch before the tool was implemented.';
    static flags = {
        ...esConnectionFlags,
        ...DefaultFlags,
        description: Flags.string({
            char: 'd',
            description: 'Description to be saved to history.',
            default: ''
        })
    };

    static args = [...DefaultArgs];

    @createMigrationHistory()
    @migrateLock()
    async run(): Promise<void> {
        const { flags, args } = await this.parse(Index);
        const { findBy } = toolConfigRepository();
        const configEntity = await findBy(new ToolConfigSpec(flags, this.config));

        await migrationBaselineVersionService(
            args.name,
            flags.description,
            configEntity.allMigrationConfig
        ).makeBaseline();
    }

    protected catch(err: Error & { exitCode?: number }): Promise<any> {
        CliUx.ux.error(`throw error. caused by: ${err}`);
        return super.catch(err);
    }
}
