import { expect, test } from '@oclif/test';
import * as MigrationExecutor from '../../src/executor/migration/MigrationExecutor';
import * as EsUtils from '../../src/utils/es/EsUtils';
import MockElasticsearchClient from '../mock/MockElasticsearchClient';

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
});
