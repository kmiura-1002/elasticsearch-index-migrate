import { Command } from '@oclif/core';
import { DefaultFlags, esConnectionFlags } from '../../config/flags/defaultCommandFlags';
import { createMigrationIndex } from '../../decorators/createMigrationIndex';
import { migrateLock } from '../../decorators/migrateLock';
import { DefaultArgs } from '../../config/args/defaultCommandArgs';

export default class Plan extends Command {
    static description = 'Outputs the migration execution plan.';

    static flags = {
        ...DefaultFlags,
        ...esConnectionFlags
    };

    static args = [...DefaultArgs];

    @createMigrationIndex()
    @migrateLock()
    async run(): Promise<void> {
        // const { args, flags } = await this.parse(Plan);
    }
}
