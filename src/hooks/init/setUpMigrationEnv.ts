import { IConfig } from '@oclif/config';
import getElasticsearchClient, { usedEsVersion } from '../../../src_old/utils/es/EsUtils';
import { ElasticsearchVersions, MAPPING_HISTORY_INDEX_NAME } from '../../../src_old/model/types';
import { cli } from 'cli-ux';
import { readOptions } from '../../flags/flagsLoader';
import { Input } from '@oclif/command/lib/flags';
import ElasticsearchClient from '../../../src_old/utils/es/ElasticsearchClient';
import v7Mapping from '../../resources/mapping/migrate_history_esV7.json';
import v6Mapping from '../../resources/mapping/migrate_history_esV6.json';

type SetUpMigrationEnvOptions = {
    config: IConfig;
    flags: Input<any>;
};

const hook = async function (options: SetUpMigrationEnvOptions) {
    const migrationConfig = await readOptions(options.flags, options.config);
    const elasticsearchClient = getElasticsearchClient(migrationConfig.elasticsearch);
    const exists = await elasticsearchClient
        .exists({ index: MAPPING_HISTORY_INDEX_NAME })
        .catch((reason) =>
            cli.error(
                `ConnectionError:Check your elasticsearch connection config.\nreason:[${reason}]`
            )
        );

    if (!exists) {
        cli.info('migrate_history index does not exist.');
        cli.info('Create a migrate_history index for the first time.');
        await createHistoryIndex(
            elasticsearchClient,
            usedEsVersion(migrationConfig.elasticsearch.version)
        );
        cli.info('The creation of the index has been completed.');
    }
};

async function createHistoryIndex(
    esClient: ElasticsearchClient,
    esVersion?: ElasticsearchVersions
): Promise<void> {
    const mappingData = esVersion?.major === 7 ? v7Mapping : v6Mapping;
    const ret = await esClient
        .createIndex({ index: MAPPING_HISTORY_INDEX_NAME, body: mappingData })
        .catch((reason) => {
            cli.error(`Failed to create index. \nreason:[${JSON.stringify(reason)}]`, { exit: 1 });
        });
    if (!ret || ret.statusCode !== 200) {
        cli.error('Failed to create index for migrate.', { exit: 1 });
    }
}

export default hook;
