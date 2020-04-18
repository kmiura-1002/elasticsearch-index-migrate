import { expect, test } from '@oclif/test';
import * as EsUtils from '../../src/utils/es/EsUtils';
import MockElasticsearchClient from '../mock/MockElasticsearchClient';
import * as types from '../../src/model/types';
import { es7ClientContainer } from '../utils/ioc-test';
import ElasticsearchClient from '../../src/utils/es/ElasticsearchClient';
import { Bindings } from '../../src/ioc.bindings';
import { MigrateIndex } from '../../src/model/types';

describe('plan command test', () => {
    after(async () => {
        const client = es7ClientContainer().get<ElasticsearchClient>(Bindings.ElasticsearchClient);
        await client.delete('test*');
    });

    test.stdout()
        .env({
            ELASTICSEARCH_MIGRATION_LOCATIONS: `${process.cwd()}/test/data/migration`,
            ELASTICSEARCH_MIGRATION_BASELINE_VERSION: 'v1.0.0',
            ELASTICSEARCH_VERSION: '7',
            ELASTICSEARCH_HOST: 'http://localhost:9202'
        })
        .command(['plan', '-i', 'test'])
        .exit(1)
        .it('Migration file not found.');

    test.stub(EsUtils, 'default', () => new MockElasticsearchClient())
        .env({
            ELASTICSEARCH_MIGRATION_LOCATIONS: `${process.cwd()}/test/data/migration`,
            ELASTICSEARCH_MIGRATION_BASELINE_VERSION: 'v1.0.0',
            ELASTICSEARCH_VERSION: '7',
            ELASTICSEARCH_HOST: 'http://localhost:9202'
        })
        .stdout()
        .command(['plan', '-i', 'test1'])
        .it('plan test', (ctx) => {
            expect(ctx.stdout).to.contain(
                'Version Description Type      Installedon State   \nv1.0.0  description ADD_FIELD             PENDING \n'
            );
        });

    test.stub(EsUtils, 'default', () => new MockElasticsearchClient())
        .env({
            ELASTICSEARCH_MIGRATION_LOCATIONS: `${process.cwd()}/test/data/migration`,
            ELASTICSEARCH_MIGRATION_BASELINE_VERSION: 'v1.0.0',
            ELASTICSEARCH_VERSION: '7',
            ELASTICSEARCH_HOST: 'http://localhost:9202'
        })
        .stdout()
        .command(['plan', '-i', 'test2-2020.01.01'])
        .it('plan versiond index test', (ctx) => {
            expect(ctx.stdout).to.contain(
                'Version Description Type      Installedon State   \nv1.0.0  description ADD_FIELD             PENDING \n'
            );
        });

    test.stub(EsUtils, 'default', () => new MockElasticsearchClient())
        .env({
            ELASTICSEARCH_MIGRATION_LOCATIONS: `${process.cwd()}/test/data/migration`,
            ELASTICSEARCH_MIGRATION_BASELINE_VERSION: 'v1.0.0',
            ELASTICSEARCH_VERSION: '7',
            ELASTICSEARCH_HOST: 'http://localhost:9202'
        })
        .stdout()
        .command(['plan', '-i', 'test2_2020.01.01'])
        .it('plan other versiond index test', (ctx) => {
            expect(ctx.stdout).to.contain(
                'Version Description Type      Installedon State   \nv1.0.0  description ADD_FIELD             PENDING \n'
            );
        });

    test.stub(types, 'MAPPING_HISTORY_INDEX_NAME', 'test6_migrate_history')
        .env({
            ELASTICSEARCH_MIGRATION_LOCATIONS: `${process.cwd()}/test/data/migration`,
            ELASTICSEARCH_MIGRATION_BASELINE_VERSION: 'v1.0.0',
            ELASTICSEARCH_VERSION: '7',
            ELASTICSEARCH_HOST: 'http://localhost:9202'
        })
        .stdout()
        .command(['init'])
        .do(async () => {
            const testMigrateHistory = 'test6_migrate_history';
            const client = es7ClientContainer().get<ElasticsearchClient>(
                Bindings.ElasticsearchClient
            );
            for (let i = 0; i <= 10; i++) {
                const history: MigrateIndex = {
                    index_name: 'test6',
                    migrate_version: `v1.0.${i}`,
                    description: '',
                    script_name: `v1.0.${i}__create_index.json`,
                    script_type: 'ADD_FIELD',
                    installed_on: '2020-01-01T00:00:00',
                    execution_time: 1,
                    success: true
                };
                await client.postDocument(testMigrateHistory, history);
            }
            // Processing to wait for elasticsearch refresh time
            await new Promise((resolve) => setTimeout(resolve, 2000));
        })
        .command(['plan', '-i', 'test6'])
        .it('Results of 11 or more plan commands are correct.', async (ctx) => {
            expect(ctx.stdout).not.contain('PENDING');
        });
});
