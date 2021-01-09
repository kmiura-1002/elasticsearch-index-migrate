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
import { cli } from 'cli-ux';
import * as sinon from 'sinon';
import * as create from '../../src/executor/init/MigrationInitExecutor';
import { IndicesExists as IndicesExists6 } from 'es6/api/requestParams';
import { IndicesExists as IndicesExists7 } from 'es7/api/requestParams';

describe('Migrates Elasticsearch index to the latest version.', () => {
    after(async () => {
        const client = es7ClientContainer().get<ElasticsearchClient>(Bindings.ElasticsearchClient);
        await client.delete('test*');
    });

    test.stub(MigrationExecutor, 'migrate', () => Promise.resolve(1))
        .env({
            ELASTICSEARCH_MIGRATION_LOCATIONS: `${process.cwd()}/test/data/migration`,
            ELASTICSEARCH_MIGRATION_BASELINE_VERSION: 'v1.0.0',
            ELASTICSEARCH_VERSION: '7.0.0',
            ELASTICSEARCH_HOST: 'http://localhost:9202'
        })
        .stub(EsUtils, 'default', () => new MockElasticsearchClient())
        .stdout()
        .command(['migrate', '-i', 'test1'])
        .it('runs migrate', (ctx) => {
            expect(ctx.stdout).to.contain('Migration completed. (count: 1)');
            expect(ctx.stdout).to.not.contain('Display of the result difference.');
        });

    test.stub(MigrationExecutor, 'migrate', () => Promise.resolve(undefined))
        .stub(cli, 'error', sinon.stub())
        .env({
            ELASTICSEARCH_MIGRATION_LOCATIONS: `${process.cwd()}/test/data/migration`,
            ELASTICSEARCH_MIGRATION_BASELINE_VERSION: 'v1.0.0',
            ELASTICSEARCH_VERSION: '7.0.0',
            ELASTICSEARCH_HOST: 'http://localhost:9202'
        })
        .stdout()
        .command(['migrate', '-i', 'test1'])
        .exit(1)
        .it('An error occurs when the migration process fails.', async () => {
            const error = (cli.error as unknown) as sinon.SinonStub;
            expect(error.calledWith('Migration failed.')).is.true;
        });

    test.stdout()
        .stub(cli, 'error', sinon.stub())
        .env({
            ELASTICSEARCH_MIGRATION_LOCATIONS: `${process.cwd()}/test/data/migration`,
            ELASTICSEARCH_MIGRATION_BASELINE_VERSION: 'v1.0.0',
            ELASTICSEARCH_VERSION: '7.0.0',
            ELASTICSEARCH_HOST: 'http://localhost:9202'
        })
        .command(['migrate', '-i', 'not_fount'])
        .exit(1)
        .it('An error occurs when there is no migration target.', async () => {
            const error = (cli.error as unknown) as sinon.SinonStub;
            expect(error.calledWith('Migration file not found.')).is.true;
        });

    test.stub(types, 'MAPPING_HISTORY_INDEX_NAME', 'test3_migrate_history')
        .env({
            ELASTICSEARCH_MIGRATION_LOCATIONS: `${process.cwd()}/test/data/migration`,
            ELASTICSEARCH_MIGRATION_BASELINE_VERSION: 'v1.0.0',
            ELASTICSEARCH_VERSION: '7.0.0',
            ELASTICSEARCH_HOST: 'http://localhost:9202'
        })
        .stdout()
        .command(['init'])
        .command(['migrate', '-i', 'test3'])
        .it('migration_history check', async () => {
            // Processing to wait for elasticsearch refresh time
            await new Promise((resolve) => setTimeout(resolve, 2000));
            const testMigrateHistory = 'test3_migrate_history';
            const client = es7ClientContainer().get<ElasticsearchClient>(
                Bindings.ElasticsearchClient
            );

            const searchRet = await client.search<MigrateIndex>({
                index: testMigrateHistory,
                body: {
                    query: {
                        match_all: {}
                    }
                }
            });
            await client.delete('test3');
            await client.delete(testMigrateHistory);
            client.close();
            expect(searchRet[0].index_name).to.eq('test3');
            expect(searchRet[0].migrate_version).to.eq('v1.0.0');
            expect(searchRet[0].description).to.eq('test index3');
            expect(searchRet[0].script_name).to.eq('v1.0.0__create_index.json');
            expect(searchRet[0].script_type).to.eq('CREATE_INDEX');
            expect(searchRet[0].success).to.true;
        });

    test.stub(types, 'MAPPING_HISTORY_INDEX_NAME', 'test4_migrate_history')
        .stub(cli, 'info', sinon.stub())
        .env({
            ELASTICSEARCH_MIGRATION_LOCATIONS: `${process.cwd()}/test/data/migration`,
            ELASTICSEARCH_MIGRATION_BASELINE_VERSION: 'v1.0.0',
            ELASTICSEARCH_VERSION: '7.0.0',
            ELASTICSEARCH_HOST: 'http://localhost:9202'
        })
        .stdout()
        .command(['init'])
        .command(['migrate', '-i', 'test4'])
        .it(
            'Return the number of successful migrations when multiple migrations have been made.',
            async () => {
                // Processing to wait for elasticsearch refresh time
                await new Promise((resolve) => setTimeout(resolve, 2000));
                const testMigrateHistory = 'test4_migrate_history';
                const client = es7ClientContainer().get<ElasticsearchClient>(
                    Bindings.ElasticsearchClient
                );

                const searchRet = await client.search<MigrateIndex>({
                    index: testMigrateHistory,
                    body: {
                        query: {
                            match_all: {}
                        }
                    }
                });
                await client.delete('test4');
                await client.delete(testMigrateHistory);
                client.close();
                expect(searchRet.length).to.eq(2);
                expect(searchRet[0].index_name).to.eq('test4');
                expect(searchRet[0].migrate_version).to.eq('v1.0.0');
                expect(searchRet[0].script_name).to.eq('v1.0.0__create_index.json');
                expect(searchRet[0].script_type).to.eq('CREATE_INDEX');
                expect(searchRet[0].success).to.true;
                expect(searchRet[1].index_name).to.eq('test4');
                expect(searchRet[1].migrate_version).to.eq('v1.0.1');
                expect(searchRet[1].script_name).to.eq('v1.0.1__add_field.json');
                expect(searchRet[1].script_type).to.eq('ADD_FIELD');
                expect(searchRet[1].success).to.true;
                const info = cli.info as sinon.SinonStub;
                expect(info.calledWith('Migration completed. (count: 2)')).is.true;
            }
        );

    test.stub(types, 'MAPPING_HISTORY_INDEX_NAME', 'test5_migrate_history')
        .stub(cli, 'info', sinon.stub())
        .env({
            ELASTICSEARCH_MIGRATION_LOCATIONS: `${process.cwd()}/test/data/migration`,
            ELASTICSEARCH_MIGRATION_BASELINE_VERSION: 'v1.0.0',
            ELASTICSEARCH_VERSION: '7.0.0',
            ELASTICSEARCH_HOST: 'http://localhost:9202'
        })
        .stdout()
        .command(['init'])
        .do(async () => {
            const testMigrateHistory = 'test5_migrate_history';
            const client = es7ClientContainer().get<ElasticsearchClient>(
                Bindings.ElasticsearchClient
            );
            const history: MigrateIndex = {
                index_name: 'test5',
                migrate_version: 'v1.0.0',
                description: '',
                script_name: 'v1.0.0__create_index.json',
                script_type: 'CREATE_INDEX',
                installed_on: '2020-01-01T00:00:00',
                execution_time: 1,
                success: true
            };
            await client.postDocument({
                index: testMigrateHistory,
                body: history,
                refresh: true
            });
        })
        .command(['migrate', '-i', 'test5'])
        .it('There is no error if you run it again after the migration is done.', async () => {
            const info = cli.info as sinon.SinonStub;
            expect(info.calledWith('There was no migration target.')).is.true;
        });

    test.stub(cli, 'error', sinon.stub())
        .stub(
            EsUtils,
            'default',
            () =>
                new (class extends MockElasticsearchClient {
                    exists(_param: IndicesExists6 | IndicesExists7) {
                        return Promise.resolve(false);
                    }
                })()
        )
        .env({
            ELASTICSEARCH_MIGRATION_LOCATIONS: `${process.cwd()}/test/data/migration`,
            ELASTICSEARCH_MIGRATION_BASELINE_VERSION: 'v1.0.0',
            ELASTICSEARCH_VERSION: '7.0.0',
            ELASTICSEARCH_HOST: 'http://localhost:9202'
        })
        .stdout()
        .command(['migrate', '-i', 'test1', '--no-init'])
        .exit(1)
        .it('If there is no migration environment, an error will occur.', async () => {
            const error = (cli.error as unknown) as sinon.SinonStub;
            expect(
                error.calledWith(
                    'Migration environment is not ready. Execute the init command. Or, run the command with "--init"'
                )
            ).is.true;
        });

    test.stub(create, 'createHistoryIndex', sinon.stub().returns(Promise.resolve()))
        .stub(MigrationExecutor, 'migrate', () => Promise.resolve(1))
        .stub(cli, 'info', sinon.stub())
        .stub(
            EsUtils,
            'default',
            () =>
                new (class extends MockElasticsearchClient {
                    exists(_param: IndicesExists6 | IndicesExists7) {
                        return Promise.resolve(false);
                    }
                })()
        )
        .env({
            ELASTICSEARCH_MIGRATION_LOCATIONS: `${process.cwd()}/test/data/migration`,
            ELASTICSEARCH_MIGRATION_BASELINE_VERSION: 'v1.0.0',
            ELASTICSEARCH_VERSION: '7.0.0',
            ELASTICSEARCH_HOST: 'http://localhost:9202'
        })
        .stdout()
        .command(['migrate', '-i', 'test1', '--init'])
        .it('If there is no migration_history index, create one and migrate it.', async () => {
            const info = cli.info as sinon.SinonStub;
            expect(info.calledWith('migrate_history index does not exist.')).is.true;
            expect(info.calledWith('Create a migrate_history index for the first time.')).is.true;
            expect(info.calledWith('The creation of the index has been completed.')).is.true;
            expect(info.calledWith('Migration completed. (count: 1)')).is.true;
        });

    test.stub(types, 'MAPPING_HISTORY_INDEX_NAME', 'test2_migrate_history')
        .stub(cli, 'info', sinon.stub())
        .env({
            ELASTICSEARCH_MIGRATION_LOCATIONS: `${process.cwd()}/test/data/migration`,
            ELASTICSEARCH_MIGRATION_BASELINE_VERSION: 'v1.0.0',
            ELASTICSEARCH_VERSION: '7.0.0',
            ELASTICSEARCH_HOST: 'http://localhost:9202'
        })
        .stdout()
        .command(['migrate', '-i', 'test2', '--showDiff'])
        .it('Output the index difference after migration(indexing)', async () => {
            const info = cli.info as sinon.SinonStub;
            expect(info.calledWith('Display of the result difference.')).is.true;
        });

    test.stub(types, 'MAPPING_HISTORY_INDEX_NAME', 'test7_migrate_history')
        .stub(cli, 'info', sinon.stub())
        .env({
            ELASTICSEARCH_MIGRATION_LOCATIONS: `${process.cwd()}/test/data/migration`,
            ELASTICSEARCH_MIGRATION_BASELINE_VERSION: 'v1.0.0',
            ELASTICSEARCH_VERSION: '7.0.0',
            ELASTICSEARCH_HOST: 'http://localhost:9202'
        })
        .do(async () => {
            const client = es7ClientContainer().get<ElasticsearchClient>(
                Bindings.ElasticsearchClient
            );
            await client.createIndex({
                index: 'test7',
                body: {
                    settings: {
                        index: {
                            refresh_interval: '1s',
                            number_of_shards: 1,
                            number_of_replicas: 0
                        }
                    },
                    mappings: {
                        properties: {
                            name: {
                                type: 'text'
                            }
                        }
                    }
                }
            });
        })
        .stdout()
        .command(['migrate', '-i', 'test7', '--showDiff'])
        .it('Output the index difference after migration(add field)', async () => {
            const info = cli.info as sinon.SinonStub;
            expect(info.calledWith('Display of the result difference.')).is.true;
        });
});
