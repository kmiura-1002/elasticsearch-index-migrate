import { CliUx, Command, Flags } from '@oclif/core';
import { DefaultFlags, esConnectionFlags } from '../../config/flags/defaultCommandFlags';
import { DefaultArgs } from '../../config/args/defaultCommandArgs';
import { createMigrationHistory } from '../../decorators/createMigrationHistory';
import { migrateLock } from '../../decorators/migrateLock';

export default class Migrate extends Command {
    static description =
        'Migrate the index/template of Elasticsearch to the latest version based on the execution plan.';

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
        // const { _args, flags } = await this.parse(Migrate);
        // const { findBy } = toolConfigRepository();
        // const _configEntity = await findBy(new ToolConfigSpec(flags, this.config));
    }

    protected catch(err: Error & { exitCode?: number }): Promise<any> {
        CliUx.ux.error(`throw error. caused by: ${err}`);
        return super.catch(err);
    }
}
