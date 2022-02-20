import { Command, Flags } from '@oclif/core';
import { CreateMigrationHistoryIfNotExists } from '../../decorators/createMigrationHistory';
import { DefaultFlags, esConnectionFlags } from '../../flags/defaultCommandFlags';

export default class Plan extends Command {
    static description = 'describe the command here';

    static examples = [`$ mynewcli hello hello world from ./src/hello.ts!`];

    static flags = {
        ...DefaultFlags,
        ...esConnectionFlags,
        // flag with a value (-n, --name=VALUE)
        name: Flags.string({ char: 'n', description: 'name to print' }),
        // flag with no value (-f, --force)
        force: Flags.boolean({ char: 'f' })
    };

    static args = [{ name: 'file' }];

    @CreateMigrationHistoryIfNotExists()
    async run() {
        const { args, flags } = await this.parse(Plan);

        this.log(`plan`);
        if (args.file && flags.force) {
            this.log(`you input --force and --file: ${args.file}`);
        }
    }
}
