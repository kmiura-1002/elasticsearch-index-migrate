import getElasticsearchClient, { usedEsVersion } from '../utils/es/EsUtils';
import { ClusterStatuses, MAPPING_HISTORY_INDEX_NAME } from '../model/types';
import { cli } from 'cli-ux';
import AbstractCommand, { DefaultOptions, HistoryIndexOptions } from '../AbstractCommand';
import { createHistoryIndex } from '../executor/init/MigrationInitExecutor';

export default class Init extends AbstractCommand {
    static description = 'Set up a migration environment.';
    static flags = {
        ...HistoryIndexOptions,
        ...DefaultOptions
    };

    async run(): Promise<void> {
        const { flags } = this.parse(Init) as any;
        const client = getElasticsearchClient(this.migrationConfig.elasticsearch);
        const health = await client.healthCheck();

        if (health.status === ClusterStatuses.YELLOW) {
            cli.info('cluster status is yellow.');
        } else if (health.status === ClusterStatuses.RED) {
            cli.error('cluster status is red.');
            cli.exit(1);
        }
        cli.info('Start creating index for migrate.');

        const exists = await client.exists({ index: MAPPING_HISTORY_INDEX_NAME });
        if (exists) {
            cli.info(`${MAPPING_HISTORY_INDEX_NAME} index already exists.`);
            cli.exit(1);
        } else {
            const number_of_shards = flags['number-of-shards'];
            const number_of_replicas = flags['number-of-replicas'];
            await createHistoryIndex(
                client,
                usedEsVersion(this.migrationConfig.elasticsearch.version),
                number_of_shards,
                number_of_replicas
            );
        }
        cli.info('Finish creating index for migrate.');
    }
}
