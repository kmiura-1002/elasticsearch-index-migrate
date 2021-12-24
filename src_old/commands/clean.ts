import { flags } from '@oclif/command';
import getElasticsearchClient from '../utils/es/EsUtils';
import { CLEAN_TARGET, cleanTargets } from '../model/types';
import { cli } from 'cli-ux';
import AbstractCommand, { CommandOptions } from '../AbstractCommand';
import { cleanExecutor } from '../executor/clean/CleanExecutor';

export default class Clean extends AbstractCommand {
    static description = 'Delete all history stored in the migration_history index';
    static flags = {
        ...CommandOptions,
        target: flags.enum({
            description:
                'Selecting what to delete \nhistory : Delete the target index migration history from migration_history\nindex : Delete the target index from elasticsearch\nall : Delete both migration history and index',
            char: 't',
            default: 'history',
            options: [...cleanTargets]
        }),
        yes: flags.boolean({
            char: 'y',
            description: 'Always answer "yes" to any prompt that appears during processing',
            default: false
        })
    };

    async run(): Promise<void> {
        const { flags } = this.parse(Clean);
        const client = getElasticsearchClient(this.migrationConfig.elasticsearch);
        const indexName = this.indexName(flags);
        switch (flags.target) {
            case 'history':
                cli.info(`Delete ${indexName} index history from migration history.`);
                break;
            case 'index':
                cli.info(`Delete ${indexName} index from elasticsearch.`);
                break;
            case 'all':
                cli.info(`Delete ${indexName} index from elasticsearch.`);
                cli.info(
                    `In addition to this, Delete ${indexName} index history from migration history.`
                );
                break;
        }
        if (!flags.yes && !(await cli.confirm('Do you delete data really ? (y/n)'))) {
            cli.info('Aborting the process.');
            cli.exit();
        }
        cli.info('Start delete data.');
        await cleanExecutor(client, indexName, flags.target as CLEAN_TARGET);
        cli.info('Finish delete data.');
    }
}
