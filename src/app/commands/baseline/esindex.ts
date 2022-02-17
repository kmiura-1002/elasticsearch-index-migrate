import { Command, flags } from '@oclif/command';
import { cli } from 'cli-ux';
import { CreateMigrationHistoryIfNotExists } from '../../decorators/createMigrationHistory';
import { DefaultFlags, esConnectionFlags } from '../../flags/defaultCommandFlags';
import migrationBaselineVersionService from '../../service/migrationBaselineVersionService';

export default class EsIndex extends Command {
    static description =
        'Create a baseline in migration_history if you were running Elasticsearch before the tool was implemented.';
    static flags = {
        ...esConnectionFlags,
        ...DefaultFlags,
        index: flags.string({
            char: 'i',
            description: 'migration index name.',
            required: true
        }),
        description: flags.string({
            char: 'd',
            description: 'Description to be saved to history.'
        })
    };

    @CreateMigrationHistoryIfNotExists()
    async run(): Promise<void> {
        try {
            const { flags } = this.parse(EsIndex);
            const { makeBaseline } = migrationBaselineVersionService(flags, this.config);
            await makeBaseline();
        } catch (e) {
            cli.error(`throw error. caused by: ${e}`);
        }
    }
}
