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

describe('baseline command test', () => {
    after(async () => {
        const client = es7ClientContainer().get<ElasticsearchClient>(Bindings.ElasticsearchClient);
        await client.delete('test*');
    });

    test.stub(cli, 'error', sinon.stub())
        .stub(
            EsUtils,
            'default',
            () =>
                new (class extends MockElasticsearchClient {
                    exists(_index: string) {
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
        .command(['baseline', '-i', 'test1', '--no-init'])
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
        .stub(cli, 'error', sinon.stub())
        .stub(cli, 'info', sinon.stub())
        .stub(
            EsUtils,
            'default',
            () =>
                new (class extends MockElasticsearchClient {
                    exists(_index: string) {
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
        .command(['baseline', '-i', 'test1'])
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
            ELASTICSEARCH_VERSION: '7',
            ELASTICSEARCH_HOST: 'http://localhost:9202'
        })
        .stdout()
        .command(['baseline', '-i', 'test2'])
        .it('The ability to create a baseline history.', async () => {
            const info = cli.info as sinon.SinonStub;
            expect(info.calledWith('Baseline history does not exist.')).is.true;
            expect(info.calledWith('Create baseline in v1.0.0.')).is.true;
            expect(info.calledWith('Successfully created a baseline in v1.0.0.')).is.true;
            const client = es7ClientContainer().get<ElasticsearchClient>(
                Bindings.ElasticsearchClient
            );
            // Processing to wait for elasticsearch refresh time
            await new Promise((resolve) => setTimeout(resolve, 2000));
            const ret = await client.search<MigrateIndex>('test1_migrate_history', {
                query: {
                    bool: {
                        must: [
                            {
                                term: {
                                    index_name: {
                                        value: 'test2'
                                    }
                                }
                            },
                            {
                                term: {
                                    migrate_version: {
                                        value: 'v1.0.0'
                                    }
                                }
                            }
                        ]
                    }
                }
            });
            expect(ret).is.an('array').lengthOf(1);
            expect(ret[0].description).is.equal('Migration baseline');
        });

    test.stub(types, 'MAPPING_HISTORY_INDEX_NAME', 'test2_migrate_history')
        .stub(cli, 'info', sinon.stub())
        .env({
            ELASTICSEARCH_MIGRATION_LOCATIONS: `${process.cwd()}/test/data/migration`,
            ELASTICSEARCH_MIGRATION_BASELINE_VERSION: 'v1.0.0',
            ELASTICSEARCH_VERSION: '7',
            ELASTICSEARCH_HOST: 'http://localhost:9202'
        })
        .stdout()
        .command(['baseline', '-i', 'test3', '-d', 'test description'])
        .it('The ability to create a baseline with a specified description.', async () => {
            const info = cli.info as sinon.SinonStub;
            expect(info.calledWith('Baseline history does not exist.')).is.true;
            expect(info.calledWith('Create baseline in v1.0.0.')).is.true;
            expect(info.calledWith('Successfully created a baseline in v1.0.0.')).is.true;
            const client = es7ClientContainer().get<ElasticsearchClient>(
                Bindings.ElasticsearchClient
            );
            // Processing to wait for elasticsearch refresh time
            await new Promise((resolve) => setTimeout(resolve, 2000));
            const ret = await client.search<MigrateIndex>('test2_migrate_history', {
                query: {
                    bool: {
                        must: [
                            {
                                term: {
                                    index_name: {
                                        value: 'test3'
                                    }
                                }
                            },
                            {
                                term: {
                                    migrate_version: {
                                        value: 'v1.0.0'
                                    }
                                }
                            }
                        ]
                    }
                }
            });
            expect(ret).is.an('array').lengthOf(1);
            expect(ret[0].description).is.equal('test description');
        });

    test.stub(types, 'MAPPING_HISTORY_INDEX_NAME', 'test3_migrate_history')
        .stub(cli, 'info', sinon.stub())
        .env({
            ELASTICSEARCH_MIGRATION_LOCATIONS: `${process.cwd()}/test/data/migration`,
            ELASTICSEARCH_MIGRATION_BASELINE_VERSION: 'v1.0.0',
            ELASTICSEARCH_VERSION: '7',
            ELASTICSEARCH_HOST: 'http://localhost:9202'
        })
        .command(['init'])
        .do(async () => {
            const testMigrateHistory = 'test3_migrate_history';
            const client = es7ClientContainer().get<ElasticsearchClient>(
                Bindings.ElasticsearchClient
            );
            const history: MigrateIndex = {
                index_name: 'test1',
                migrate_version: 'v1.0.0',
                description: '',
                script_name: `v1.0.0__create_index.json`,
                script_type: 'ADD_FIELD',
                installed_on: '2020-01-01T00:00:00',
                execution_time: 1,
                success: false
            };
            await client.postDocument(testMigrateHistory, history);
            // Processing to wait for elasticsearch refresh time
            await new Promise((resolve) => setTimeout(resolve, 2000));
        })
        .stdout()
        .command(['baseline', '-i', 'test1'])
        .it('If a baseline exists, do not process anything.', async () => {
            const info = cli.info as sinon.SinonStub;
            expect(info.calledWith('There is already a baseline history')).is.true;
        });

    test.stub(
        EsUtils,
        'default',
        () =>
            new (class extends MockElasticsearchClient {
                search(_index: string, _query?: any) {
                    return Promise.reject('failed search');
                }
                exists(_index: string): Promise<boolean> {
                    return Promise.resolve(true);
                }
            })()
    )
        .stub(cli, 'error', sinon.stub())
        .env({
            ELASTICSEARCH_MIGRATION_LOCATIONS: `${process.cwd()}/test/data/migration`,
            ELASTICSEARCH_MIGRATION_BASELINE_VERSION: 'v1.0.0',
            ELASTICSEARCH_VERSION: '7',
            ELASTICSEARCH_HOST: 'http://localhost:9202'
        })
        .stdout()
        .command(['baseline', '-i', 'test1'])
        .exit(1)
        .it(
            'To terminate the process with an error message when the search for the migration history fails.',
            async () => {
                const error = (cli.error as unknown) as sinon.SinonStub;
                expect(error.calledWith('failed search')).is.true;
            }
        );

    test.stub(
        EsUtils,
        'default',
        () =>
            new (class extends MockElasticsearchClient {
                search(_index: string, _query?: any) {
                    return Promise.resolve<MigrateIndex[]>([]);
                }
                exists(_index: string): Promise<boolean> {
                    return Promise.resolve(true);
                }
                postDocument(_indexName: string, _body: any): Promise<any> {
                    return Promise.reject('failed post document');
                }
            })()
    )
        .stub(cli, 'info', sinon.stub())
        .stub(cli, 'error', sinon.stub())
        .env({
            ELASTICSEARCH_MIGRATION_LOCATIONS: `${process.cwd()}/test/data/migration`,
            ELASTICSEARCH_MIGRATION_BASELINE_VERSION: 'v1.0.0',
            ELASTICSEARCH_VERSION: '7',
            ELASTICSEARCH_HOST: 'http://localhost:9202'
        })
        .stdout()
        .command(['baseline', '-i', 'test1'])
        .exit(1)
        .it(
            'If post of a document fails, print out the error message and terminate the process.',
            async () => {
                const info = cli.info as sinon.SinonStub;
                expect(info.calledWith('Baseline history does not exist.')).is.true;
                expect(info.calledWith('Create baseline in v1.0.0.')).is.true;

                const error = (cli.error as unknown) as sinon.SinonStub;
                expect(error.calledWith('failed post document')).is.true;
            }
        );
});
