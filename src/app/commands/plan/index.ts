import { CliUx, Command, Flags } from '@oclif/core';
import { DefaultFlags, esConnectionFlags } from '../../config/flags/defaultCommandFlags';
import { createMigrationHistory } from '../../decorators/createMigrationHistory';
import { migrateLock } from '../../decorators/migrateLock';
import { DefaultArgs } from '../../config/args/defaultCommandArgs';
import { migrationPlanService } from '../../service/migrationPlanService';
import { toolConfigRepository } from '../../context/config_domain/toolConfigRepository';
import { ToolConfigSpec } from '../../context/config_domain/spec';

export default class Plan extends Command {
    static description = 'Outputs the migration execution plan.';

    static flags = {
        ...DefaultFlags,
        ...esConnectionFlags,
        ignoredMigrations: Flags.boolean({
            default: false,
            env: 'IGNORED_MIGRATIONS',
            description:
                'Migration target for additions made during the already migrated version.\nFor example, use this option when you want to migrate v2.0.0 when v1.0.0 and v3.0.0 have already been migrated. Normally, this will result in an ingnore status. Setting this option to true will make v2.0.0 the next migration version after v3.0.0.'
        })
    };

    static args = [...DefaultArgs];

    @createMigrationHistory()
    @migrateLock()
    async run(): Promise<void> {
        const { args, flags } = await this.parse(Plan);
        const { findBy } = toolConfigRepository();
        const configEntity = await findBy(new ToolConfigSpec(flags, this.config));

        const service = migrationPlanService(
            args.name,
            {
                ignored: flags.ignoredMigrations,
                future: false,
                missing: false,
                outOfOrder: false,
                pending: false
            },
            configEntity.allMigrationConfig
        );
        await service.refresh();
    }

    protected catch(err: Error & { exitCode?: number }): Promise<any> {
        CliUx.ux.error(`throw error. caused by: ${err}`);
        return super.catch(err);
    }
}
