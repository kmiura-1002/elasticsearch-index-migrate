import { expect, test } from '@oclif/test';
import * as EsUtils from '../../src/utils/es/EsUtils';
import MockElasticsearchClient from '../mock/MockElasticsearchClient';
import * as types from '../../src/model/types';
import { es7ClientContainer } from '../utils/ioc-test';
import ElasticsearchClient from '../../src/utils/es/ElasticsearchClient';
import { Bindings } from '../../src/ioc.bindings';
import { MAPPING_HISTORY_INDEX_NAME, MigrateIndex } from '../../src/model/types';
import { cli } from 'cli-ux';
import * as sinon from 'sinon';
import * as create from '../../src/executor/init/MigrationInitExecutor';
import * as MigrationExecutor from '../../src/executor/migration/MigrationExecutor';
import {
    IndicesExists as IndicesExists6,
    Search as Search6,
    DeleteByQuery as DeleteByQuery6
} from 'es6/api/requestParams';
import {
    IndicesExists as IndicesExists7,
    Search as Search7,
    DeleteByQuery as DeleteByQuery7
} from 'es7/api/requestParams';

describe('recovery command test', () => {
    after(async () => {
        const client = es7ClientContainer().get<ElasticsearchClient>(Bindings.ElasticsearchClient);
        await client.delete({ index: 'test*' });
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
        .command(['recovery', '-i', 'test1', '--no-init'])
        .exit(1)
        .it('If there is no migration environment, an error will occur.', async () => {
            const error = cli.error as unknown as sinon.SinonStub;
            expect(
                error.calledWith(
                    'Migration environment is not ready. Execute the init command. Or, run the command with "--init"'
                )
            ).is.true;
        });

    test.stub(create, 'createHistoryIndex', sinon.stub().returns(Promise.resolve()))
        .stub(MigrationExecutor, 'migrate', () => Promise.resolve(1))
        .stub(cli, 'error', sinon.stub())
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
            ELASTICSEARCH_VERSION: '7',
            ELASTICSEARCH_HOST: 'http://localhost:9202'
        })
        .stdout()
        .command(['recovery', '-i', 'test1'])
        .it('If there is no migration_history index, create one and migrate it.', async () => {
            const info = cli.info as sinon.SinonStub;
            expect(info.calledWith('migrate_history index does not exist.')).is.true;
            expect(info.calledWith('Create a migrate_history index for the first time.')).is.true;
            expect(info.calledWith('The creation of the index has been completed.')).is.true;
        });

    test.stub(types, 'MAPPING_HISTORY_INDEX_NAME', 'test1_migrate_history')
        .stub(cli, 'info', sinon.stub())
        .env({
            ELASTICSEARCH_MIGRATION_LOCATIONS: `${process.cwd()}/test/data/migration`,
            ELASTICSEARCH_MIGRATION_BASELINE_VERSION: 'v1.0.0',
            ELASTICSEARCH_VERSION: '7.0.0',
            ELASTICSEARCH_HOST: 'http://localhost:9202'
        })
        .command(['init'])
        .do(async () => {
            const testMigrateHistory = 'test1_migrate_history';
            const client = es7ClientContainer().get<ElasticsearchClient>(
                Bindings.ElasticsearchClient
            );
            for (let i = 0; i <= 10; i++) {
                const history: MigrateIndex = {
                    index_name: 'test1',
                    migrate_version: `v1.0.${i}`,
                    description: '',
                    script_name: `v1.0.${i}__create_index.json`,
                    script_type: 'ADD_FIELD',
                    installed_on: '2020-01-01T00:00:00',
                    execution_time: 1,
                    success: false
                };
                await client.postDocument({
                    index: testMigrateHistory,
                    body: history,
                    refresh: true
                });
            }
        })
        .stdout()
        .command(['recovery', '-i', 'test1'])
        .it('Successfully deleting a failed migration history.', async () => {
            const info = cli.info as sinon.SinonStub;
            expect(info.calledWith('11 errors in the migration history.')).is.true;
            Array.from(Array(11)).forEach((_v, i) => {
                expect(info.calledWith(`Failed migration of v1.0.${i}__create_index.json.`)).is
                    .true;
            });
            expect(info.calledWith('I will delete the above history.')).is.true;
            const client = es7ClientContainer().get<ElasticsearchClient>(
                Bindings.ElasticsearchClient
            );
            // Processing to wait for elasticsearch refresh time
            await new Promise((resolve) => setTimeout(resolve, 2000));
            const ret = await client.search<MigrateIndex>({
                index: 'test1_migrate_history',
                body: {
                    size: 10000,
                    query: {
                        bool: {
                            must: [
                                {
                                    term: {
                                        index_name: {
                                            value: 'test1'
                                        }
                                    }
                                },
                                {
                                    term: {
                                        success: {
                                            value: 'false'
                                        }
                                    }
                                }
                            ]
                        }
                    }
                }
            });
            expect(ret).is.empty;
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
        .command(['recovery', '-i', 'test1'])
        .it('Do nothing when there is no history of failed migrations.', async () => {
            const info = cli.info as sinon.SinonStub;
            expect(info.calledWith('No history of failed migrations.')).is.true;
        });

    test.stub(
        EsUtils,
        'default',
        () =>
            new (class extends MockElasticsearchClient {
                search(_param: Search6 | Search7) {
                    return Promise.reject('failed search');
                }
                exists(_param: IndicesExists6 | IndicesExists7): Promise<boolean> {
                    return Promise.resolve(true);
                }
            })()
    )
        .stub(cli, 'error', sinon.stub())
        .env({
            ELASTICSEARCH_MIGRATION_LOCATIONS: `${process.cwd()}/test/data/migration`,
            ELASTICSEARCH_MIGRATION_BASELINE_VERSION: 'v1.0.0',
            ELASTICSEARCH_VERSION: '7.0.0',
            ELASTICSEARCH_HOST: 'http://localhost:9202'
        })
        .stdout()
        .command(['recovery', '-i', 'test1'])
        .exit(1)
        .it(
            'To terminate the process with an error message when the search for the migration history fails.',
            async () => {
                const error = cli.error as unknown as sinon.SinonStub;
                expect(error.calledWith('"failed search"')).is.true;
            }
        );

    test.stub(
        EsUtils,
        'default',
        () =>
            new (class extends MockElasticsearchClient {
                search(_param: Search6 | Search7) {
                    return Promise.resolve<MigrateIndex[]>([
                        {
                            index_name: 'test',
                            migrate_version: 'test',
                            description: 'test',
                            script_name: 'test',
                            script_type: 'ADD_FIELD',
                            installed_on: '1970-01-01 00:00:00',
                            execution_time: 1,
                            success: false
                        }
                    ]);
                }
                exists(_param: IndicesExists6 | IndicesExists7): Promise<boolean> {
                    return Promise.resolve(true);
                }
                deleteDocument(_param: DeleteByQuery6 | DeleteByQuery7): Promise<any> {
                    return Promise.reject('failed delete document');
                }
            })()
    )
        .stub(cli, 'info', sinon.stub())
        .stub(cli, 'error', sinon.stub())
        .env({
            ELASTICSEARCH_MIGRATION_LOCATIONS: `${process.cwd()}/test/data/migration`,
            ELASTICSEARCH_MIGRATION_BASELINE_VERSION: 'v1.0.0',
            ELASTICSEARCH_VERSION: '7.0.0',
            ELASTICSEARCH_HOST: 'http://localhost:9202'
        })
        .stdout()
        .command(['recovery', '-i', 'test1'])
        .exit(1)
        .it(
            'If deletion of a document fails, print out the error message and terminate the process.',
            async () => {
                const info = cli.info as sinon.SinonStub;
                expect(info.calledWith('1 errors in the migration history.')).is.true;
                expect(info.calledWith('Failed migration of test.')).is.true;
                expect(info.calledWith('I will delete the above history.')).is.true;

                const error = cli.error as unknown as sinon.SinonStub;
                expect(error.calledWith('"failed delete document"')).is.true;
            }
        );
});
