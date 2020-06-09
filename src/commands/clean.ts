import { flags } from '@oclif/command';
import getElasticsearchClient from '../utils/es/EsUtils';
import { CLEAN_TARGET, cleanTargets } from '../model/types';
import { cli } from 'cli-ux';
import AbstractCommand, { DefaultOptions } from '../AbstractCommand';
import { cleanExecutor } from '../executor/clean/CleanExecutor';

export default class Clean extends AbstractCommand {
    static description = 'Delete all history stored in the migration_history index';
    static flags = {
        ...DefaultOptions,
        indexName: flags.string({
            char: 'i',
            description: 'migration index name.',
            required: true
        }),
        target: flags.enum({
            description:
                'Selecting what to delete \nhistory : Delete the target index migration history from migration_history\nindex : Not implemented\nall : Not implemented',
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

    async run() {
        const { flags } = this.parse(Clean);
        const client = getElasticsearchClient(this.migrationConfig.elasticsearch);

        switch (flags.target) {
            case 'history':
                cli.info(`Delete ${flags.indexName} index history from migration history.`);
                break;
            case 'index':
                // TODO 後で実装する
                // cli.info(`Delete ${flags.indexName} index from elasticsearch.`);
                cli.warn('Not implemented. Aborting the process.');
                cli.exit();
                break;
            case 'all':
                // TODO 後で実装する
                // cli.info(`Delete ${flags.indexName} index from elasticsearch.`);
                // cli.info(
                //     `In addition to this,  ,Delete ${flags.indexName} index history from migration history.`
                // );
                cli.warn('Not implemented. Aborting the process.');
                cli.exit();
                break;
        }
        if (!flags.yes && !(await cli.confirm('Do you delete data really ? (y/n)'))) {
            cli.info('Aborting the process.');
            cli.exit();
        }
        cli.info('Start delete data.');
        await cleanExecutor(client, flags.indexName, flags.target as CLEAN_TARGET);
        cli.info('Finish delete data.');
    }
}
