import { Command, flags } from '@oclif/command';

export default class Info extends Command {
    static description = 'Prints the details and status information about all the migrations.';
    static flags = {
        help: flags.help({ char: 'h' }),
        indexNAme: flags.string({ char: 'i', description: 'migration index name.' })
    };

    async run() {
        this.parse(Info);
    }
}
