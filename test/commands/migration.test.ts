import { expect, test } from '@oclif/test';
import * as MigrationExecutor from '../../src/executor/migration/MigrationExecutor';
import * as EsUtils from '../../src/utils/es/EsUtils';
import MockElasticsearchClient from '../mock/MockElasticsearchClient';
import * as types from '../../src/model/types';
import { es7ClientContainer } from '../utils/ioc-test';
import ElasticsearchClient from '../../src/utils/es/ElasticsearchClient';
import { Bindings } from '../../src/ioc.bindings';
import { MigrateIndex } from '../../src/model/types';
import { MAPPING_HISTORY_INDEX_NAME } from '../../src/model/types';

describe('Migrates Elasticsearch index to the latest version.', () => {
    test.stub(MigrationExecutor, 'migrate', () => Promise.resolve(1))
        .env({
            ELASTICSEARCH_MIGRATION_LOCATIONS: `${process.cwd()}/test/data/migration`,
            ELASTICSEARCH_MIGRATION_BASELINE_VERSION: 'v1.0.0',
            ELASTICSEARCH_VERSION: '7',
            ELASTICSEARCH_HOST: 'http://localhost:9202'
        })
        .stub(EsUtils, 'default', () => new MockElasticsearchClient())
        .stdout()
        .command(['migrate', '-i', 'test1'])
        .it('runs migrate', (ctx) => {
            expect(ctx.stdout).to.contain('Migration completed. (count: 1)');
        });

    test.stub(MigrationExecutor, 'migrate', () => Promise.resolve(1))
        .env({
            ELASTICSEARCH_MIGRATION_LOCATIONS: `${process.cwd()}/test/data/migration`,
            ELASTICSEARCH_MIGRATION_BASELINE_VERSION: 'v1.0.0',
            ELASTICSEARCH_VERSION: '7',
            ELASTICSEARCH_HOST: 'http://localhost:9202'
        })
        .stdout()
        .command(['migrate', '-i', 'foobaz'])
        .exit(1)
        .it('ResponseError: index_not_found_exception');

    test.stub(MigrationExecutor, 'migrate', () => Promise.resolve(undefined))
        .env({
            ELASTICSEARCH_MIGRATION_LOCATIONS: `${process.cwd()}/test/data/migration`,
            ELASTICSEARCH_MIGRATION_BASELINE_VERSION: 'v1.0.0',
            ELASTICSEARCH_VERSION: '7',
            ELASTICSEARCH_HOST: 'http://localhost:9202'
        })
        .stdout()
        .command(['migrate', '-i', 'test1'])
        .exit(1)
        .it('Migration failed.');

    test.stdout()
        .env({
            ELASTICSEARCH_MIGRATION_LOCATIONS: `${process.cwd()}/test/data/migration`,
            ELASTICSEARCH_MIGRATION_BASELINE_VERSION: 'v1.0.0',
            ELASTICSEARCH_VERSION: '7',
            ELASTICSEARCH_HOST: 'http://localhost:9202'
        })
        .command(['migrate', '-i', 'not_fount'])
        .exit(1)
        .it('Error: Migration file not found.');

    test.stub(types, 'MAPPING_HISTORY_INDEX_NAME', 'test_migrate_history')
        .env({
            ELASTICSEARCH_MIGRATION_LOCATIONS: `${process.cwd()}/test/data/migration`,
            ELASTICSEARCH_MIGRATION_BASELINE_VERSION: 'v1.0.0',
            ELASTICSEARCH_VERSION: '7',
            ELASTICSEARCH_HOST: 'http://localhost:9202'
        })
        .stdout()
        .command(['init'])
        .command(['migrate', '-i', 'test3'])
        .it('migration_history check', async () => {
            // Processing to wait for elasticsearch refresh time
            await new Promise((resolve) => setTimeout(resolve, 2000));
            const testMigrateHistory = 'test_migrate_history';
            const client = es7ClientContainer().get<ElasticsearchClient>(
                Bindings.ElasticsearchClient
            );

            const searchRet = await client.search<MigrateIndex>(testMigrateHistory, {
                query: {
                    match_all: {}
                }
            });
            await client.delete('test_index');
            await client.delete(testMigrateHistory);
            client.close();
            expect(searchRet[0].index_name).to.eq('test_index');
            expect(searchRet[0].migrate_version).to.eq('v1.0.0');
            expect(searchRet[0].description).to.eq('test index');
            expect(searchRet[0].script_name).to.eq('v1.0.0__create_index.json');
            expect(searchRet[0].script_type).to.eq('CREATE_INDEX');
            expect(searchRet[0].success).to.true;
        });
});
