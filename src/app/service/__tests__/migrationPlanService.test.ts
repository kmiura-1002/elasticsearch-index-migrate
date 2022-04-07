import { migrationPlanService } from '../migrationPlanService';
import { defaultPlanExecutionConfig } from '../../definision';
import { MIGRATE_HISTORY_INDEX_NAME, MigrationConfig, MigrationTypes } from '../../types';
import { useElasticsearchClient } from '../../client/es/ElasticsearchClient';
import v7HistoryMapping from '../../../resources/mapping/migrate_history_esV7.json';
import { mocked } from 'jest-mock';
import { getMockElasticsearchClient } from '../../../__mocks__/client/es/mockElasticsearchClient';
import { Search as Search6 } from 'es6/api/requestParams';
import { Search as Search7 } from 'es7/api/requestParams';
import { migrateIndices } from '../../../__mocks__/testsData/MigrateIndexTestData';
import * as spec from '../../context/migrate_history/spec';

jest.mock('../../client/es/ElasticsearchClient');

describe('migrationPlanService', () => {
    beforeAll(async () => {
        const { useElasticsearchClient } = jest.requireActual(
            '../../client/es/ElasticsearchClient'
        );
        const { exists, createIndex, close } = useElasticsearchClient({
            searchEngine: 'elasticsearch',
            version: '7',
            connect: {
                host: 'http://localhost:9202'
            }
        });
        if (!(await exists({ index: MIGRATE_HISTORY_INDEX_NAME }))) {
            await createIndex({
                index: MIGRATE_HISTORY_INDEX_NAME,
                body: v7HistoryMapping
            });
        }
        await close();
    });

    beforeEach(() => {
        mocked(useElasticsearchClient).mockClear();
    });

    describe('refresh', () => {
        it('can be finished', async () => {
            mocked(useElasticsearchClient).mockImplementation(() => {
                const { useElasticsearchClient } = jest.requireActual(
                    '../../client/es/ElasticsearchClient'
                );
                return {
                    ...useElasticsearchClient({
                        searchEngine: 'elasticsearch',
                        version: '7',
                        connect: {
                            host: 'http://localhost:9202'
                        }
                    })
                };
            });
            const config = {
                elasticsearch: {
                    searchEngine: 'elasticsearch',
                    version: '7',
                    connect: {
                        host: 'http://localhost:9202'
                    }
                },
                migration: {
                    location: `${process.cwd()}/src/__mocks__/testsData/migration`,
                    baselineVersion: {
                        test2: 'v1.0.0'
                    }
                }
            } as Required<MigrationConfig>;
            const explainPlan = await migrationPlanService(
                'test2',
                defaultPlanExecutionConfig(),
                config
            ).refresh();
            const actual = explainPlan.all;

            expect(
                actual.map((value) => ({
                    version: value.version,
                    status: value.state?.status
                }))
            ).toEqual([
                {
                    status: 'PENDING',
                    version: 'v1.0.0'
                },
                {
                    status: 'PENDING',
                    version: 'v1.0.1'
                },
                {
                    status: 'PENDING',
                    version: 'v1.0.2'
                },
                {
                    status: 'PENDING',
                    version: 'v1.0.3'
                },
                {
                    status: 'PENDING',
                    version: 'v1.0.4'
                },
                {
                    status: 'PENDING',
                    version: 'v1.0.5'
                },
                {
                    status: 'PENDING',
                    version: 'v1.0.6'
                },
                {
                    status: 'PENDING',
                    version: 'v1.0.7'
                },
                {
                    status: 'PENDING',
                    version: 'v1.0.8'
                },
                {
                    status: 'PENDING',
                    version: 'v1.0.9'
                },
                {
                    status: 'PENDING',
                    version: 'v1.0.10'
                }
            ]);
        });

        it('can be finished when there is an unadapted version', async () => {
            mocked(useElasticsearchClient).mockImplementation(() => {
                return {
                    ...getMockElasticsearchClient(),
                    search(_param: Search6 | Search7) {
                        return Promise.resolve(migrateIndices());
                    }
                };
            });
            const config = {
                elasticsearch: {
                    searchEngine: 'elasticsearch',
                    version: '7',
                    connect: {
                        host: 'http://localhost:9202'
                    }
                },
                migration: {
                    location: `${process.cwd()}/src/__mocks__/testsData/migration`,
                    baselineVersion: {
                        test: 'v1.0.0'
                    }
                }
            } as Required<MigrationConfig>;
            const explainPlan = await migrationPlanService(
                'test',
                defaultPlanExecutionConfig(),
                config
            ).refresh();
            const actual = explainPlan.all;
            expect(
                actual.map((value) => ({
                    version: value.version,
                    status: value.state?.status
                }))
            ).toEqual([
                {
                    status: 'BASELINE',
                    version: 'v1.0.0'
                },
                {
                    status: 'SUCCESS',
                    version: 'v1.0.1'
                },
                {
                    status: 'SUCCESS',
                    version: 'v1.0.2'
                },
                {
                    status: 'PENDING',
                    version: 'v1.0.3'
                }
            ]);
        });

        it('can be finished when a migration file is feature or missing', async () => {
            mocked(useElasticsearchClient).mockImplementation(() => {
                return {
                    ...getMockElasticsearchClient(),
                    search(_param: Search6 | Search7) {
                        return Promise.resolve([
                            {
                                script_name: 'v1.0.0__add_fieldcopy.json',
                                migrate_version: 'v1.0.0',
                                description: 'book index',
                                execution_time: 1,
                                index_name: 'test',
                                installed_on: "2020-01-01'T'00:00:00",
                                script_type: MigrationTypes.ADD_FIELD,
                                success: false,
                                checksum: undefined
                            },
                            {
                                script_name: 'v1.0.1__add_field.json',
                                migrate_version: 'v1.0.1',
                                description: 'book index',
                                execution_time: 1,
                                index_name: 'test',
                                installed_on: "2020-01-01'T'00:00:00",
                                script_type: MigrationTypes.ADD_FIELD,
                                success: true,
                                checksum: undefined
                            },
                            {
                                script_name: 'v1.0.2__add_fieldcopy.json',
                                migrate_version: 'v1.0.2',
                                description: 'book index',
                                execution_time: 1,
                                index_name: 'test',
                                installed_on: "2020-01-01'T'00:00:00",
                                script_type: MigrationTypes.ADD_FIELD,
                                success: true,
                                checksum: undefined
                            },
                            {
                                script_name: 'v10.0.0__add_fieldcopy.json',
                                migrate_version: 'v10.0.0',
                                description: 'book index',
                                execution_time: 1,
                                index_name: 'test',
                                installed_on: "2020-01-01'T'00:00:00",
                                script_type: MigrationTypes.ADD_FIELD,
                                success: true,
                                checksum: undefined
                            },
                            {
                                script_name: 'v10.0.1__add_fieldcopy.json',
                                migrate_version: 'v10.0.1',
                                description: 'book index',
                                execution_time: 1,
                                index_name: 'test',
                                installed_on: "2020-01-01'T'00:00:00",
                                script_type: MigrationTypes.ADD_FIELD,
                                success: false,
                                checksum: undefined
                            }
                        ]);
                    }
                };
            });
            const config = {
                elasticsearch: {
                    searchEngine: 'elasticsearch',
                    version: '7',
                    connect: {
                        host: 'http://localhost:9202'
                    }
                },
                migration: {
                    location: `${process.cwd()}/src/__mocks__/testsData/migration`,
                    baselineVersion: {
                        missing_file: 'v2.0.0'
                    }
                }
            } as Required<MigrationConfig>;
            const explainPlan = await migrationPlanService(
                'missing_file',
                defaultPlanExecutionConfig(),
                config
            ).refresh();
            const actual = explainPlan.all;
            expect(
                actual.map((value) => ({
                    version: value.version,
                    status: value.state?.status
                }))
            ).toEqual([
                {
                    status: 'MISSING_FAILED',
                    version: 'v1.0.0'
                },
                {
                    status: 'MISSING_SUCCESS',
                    version: 'v1.0.1'
                },
                {
                    status: 'SUCCESS',
                    version: 'v1.0.2'
                },
                {
                    status: 'FUTURE_SUCCESS',
                    version: 'v10.0.0'
                },
                {
                    status: 'FUTURE_FAILED',
                    version: 'v10.0.1'
                }
            ]);
        });

        it('can be finished same version data when there is an unadapted version', async () => {
            mocked(useElasticsearchClient).mockImplementation(() => {
                return {
                    ...getMockElasticsearchClient(),
                    search(_param: Search6 | Search7) {
                        return Promise.resolve([]);
                    }
                };
            });
            const config = {
                elasticsearch: {
                    searchEngine: 'elasticsearch',
                    version: '7',
                    connect: {
                        host: 'http://localhost:9202'
                    }
                },
                migration: {
                    location: `${process.cwd()}/src/__mocks__/testsData/migration`,
                    baselineVersion: {
                        same_version: 'v1.0.0'
                    }
                }
            } as Required<MigrationConfig>;
            const explainPlan = await migrationPlanService(
                'same_version',
                defaultPlanExecutionConfig(),
                config
            ).refresh();
            const actual = explainPlan.all;
            expect(
                actual.map((value) => ({
                    version: value.version,
                    status: value.state?.status
                }))
            ).toEqual([
                {
                    status: 'PENDING',
                    version: 'v1.0.0'
                }
            ]);
        });

        it('can be finished include ignore when there is an unadapted version', async () => {
            mocked(useElasticsearchClient).mockImplementation(() => {
                return {
                    ...getMockElasticsearchClient(),
                    search(_param: Search6 | Search7) {
                        return Promise.resolve([
                            {
                                script_name: 'v1.0.2__add_fieldcopy.json',
                                migrate_version: 'v1.0.2',
                                description: 'book index',
                                execution_time: 1,
                                index_name: 'test',
                                installed_on: "2020-01-01'T'00:00:00",
                                script_type: MigrationTypes.ADD_FIELD,
                                success: true,
                                checksum: undefined
                            }
                        ]);
                    }
                };
            });
            const config = {
                elasticsearch: {
                    searchEngine: 'elasticsearch',
                    version: '7',
                    connect: {
                        host: 'http://localhost:9202'
                    }
                },
                migration: {
                    location: `${process.cwd()}/src/__mocks__/testsData/migration`,
                    baselineVersion: {
                        test: 'v1.0.0'
                    }
                }
            } as Required<MigrationConfig>;
            const explainPlan = await migrationPlanService(
                'test',
                defaultPlanExecutionConfig(),
                config
            ).refresh();
            const actual = explainPlan.all;
            expect(
                actual.map((value) => ({
                    version: value.version,
                    status: value.state?.status
                }))
            ).toEqual([
                {
                    status: 'IGNORED',
                    version: 'v1.0.0'
                },
                {
                    status: 'IGNORED',
                    version: 'v1.0.1'
                },
                {
                    status: 'SUCCESS',
                    version: 'v1.0.2'
                },
                {
                    status: 'PENDING',
                    version: 'v1.0.3'
                }
            ]);
        });

        it('can be finished when there is a version lower than the baseline', async () => {
            mocked(useElasticsearchClient).mockImplementation(() => {
                const { useElasticsearchClient } = jest.requireActual(
                    '../../client/es/ElasticsearchClient'
                );
                return {
                    ...useElasticsearchClient({
                        searchEngine: 'elasticsearch',
                        version: '7',
                        connect: {
                            host: 'http://localhost:9202'
                        }
                    })
                };
            });
            const config = {
                elasticsearch: {
                    searchEngine: 'elasticsearch',
                    version: '7',
                    connect: {
                        host: 'http://localhost:9202'
                    }
                },
                migration: {
                    location: `${process.cwd()}/src/__mocks__/testsData/migration`,
                    baselineVersion: {
                        test: 'v1.0.2'
                    }
                }
            } as Required<MigrationConfig>;
            const explainPlan = await migrationPlanService(
                'test',
                defaultPlanExecutionConfig(),
                config
            ).refresh();
            const actual = explainPlan.all;

            expect(
                actual.map((value) => ({
                    version: value.version,
                    status: value.state?.status
                }))
            ).toEqual([
                {
                    status: 'BELOW_BASELINE',
                    version: 'v1.0.0'
                },
                {
                    status: 'BELOW_BASELINE',
                    version: 'v1.0.1'
                },
                {
                    status: 'PENDING',
                    version: 'v1.0.2'
                },
                {
                    status: 'PENDING',
                    version: 'v1.0.3'
                }
            ]);
        });

        it('can be finished when status is failed', async () => {
            mocked(useElasticsearchClient).mockImplementation(() => {
                return {
                    ...getMockElasticsearchClient(),
                    search(_param: Search6 | Search7) {
                        return Promise.resolve([
                            {
                                script_name: 'v1.0.2__add_fieldcopy.json',
                                migrate_version: 'v1.0.2',
                                description: 'book index',
                                execution_time: 1,
                                index_name: 'test',
                                installed_on: "2020-01-01'T'00:00:00",
                                script_type: MigrationTypes.ADD_FIELD,
                                success: false,
                                checksum: undefined
                            }
                        ]);
                    }
                };
            });
            const config = {
                elasticsearch: {
                    searchEngine: 'elasticsearch',
                    version: '7',
                    connect: {
                        host: 'http://localhost:9202'
                    }
                },
                migration: {
                    location: `${process.cwd()}/src/__mocks__/testsData/migration`,
                    baselineVersion: {
                        test: 'v1.0.0'
                    }
                }
            } as Required<MigrationConfig>;
            const explainPlan = await migrationPlanService(
                'test',
                defaultPlanExecutionConfig(),
                config
            ).refresh();
            const actual = explainPlan.all;

            expect(
                actual.map((value) => ({
                    version: value.version,
                    status: value.state?.status
                }))
            ).toEqual([
                {
                    status: 'IGNORED',
                    version: 'v1.0.0'
                },
                {
                    status: 'IGNORED',
                    version: 'v1.0.1'
                },
                {
                    status: 'FAILED',
                    version: 'v1.0.2'
                },
                {
                    status: 'PENDING',
                    version: 'v1.0.3'
                }
            ]);
        });

        it('throw error when there is no migration target', async () => {
            const location = `${process.cwd()}/src/__mocks__/testsData/migration`;
            const config = {
                elasticsearch: {
                    searchEngine: 'elasticsearch',
                    version: '7',
                    connect: {
                        host: 'http://localhost:9202'
                    }
                },
                migration: {
                    location,
                    baselineVersion: {
                        xxxxx: 'v1.0.0'
                    }
                }
            } as Required<MigrationConfig>;
            const actual = migrationPlanService(
                'xxxxx',
                defaultPlanExecutionConfig(),
                config
            ).refresh();

            await expect(actual).rejects.toThrowError(
                new Error(`There is no migration target for xxxxx in ${location}.`)
            );
        });

        it('throw error when there is a migration file of unknown version', async () => {
            const config = {
                elasticsearch: {
                    searchEngine: 'elasticsearch',
                    version: '7',
                    connect: {
                        host: 'http://localhost:9202'
                    }
                },
                migration: {
                    location: `${process.cwd()}/src/__mocks__/testsData/migration`,
                    baselineVersion: {
                        unknown_version: 'v1.0.0'
                    }
                }
            } as Required<MigrationConfig>;
            const actual = migrationPlanService(
                'unknown_version',
                defaultPlanExecutionConfig(),
                config
            ).refresh();

            await expect(actual).rejects.toThrowError(
                new Error(
                    'There is a migration file of unknown version.\n' +
                        'Unknown version files: test_migration_file'
                )
            );
        });

        it('throw error when baseline setting for index does not exist', async () => {
            const config = {
                elasticsearch: {
                    searchEngine: 'elasticsearch',
                    version: '7',
                    connect: {
                        host: 'http://localhost:9202'
                    }
                },
                migration: {
                    location: `${process.cwd()}/src/__mocks__/testsData/migration`,
                    baselineVersion: {
                        test: 'v1.0.0'
                    }
                }
            } as Required<MigrationConfig>;
            const index = 'unknown_index';
            const actual = migrationPlanService(
                index,
                defaultPlanExecutionConfig(),
                config
            ).refresh();

            await expect(actual).rejects.toThrowError(
                new Error(`The baseline setting for index(${index}) does not exist.`)
            );
        });

        it('throw error when the client throws an error', async () => {
            mocked(useElasticsearchClient).mockImplementation(() => {
                const { useElasticsearchClient } = jest.requireActual(
                    '../../client/es/ElasticsearchClient'
                );
                return {
                    ...useElasticsearchClient({
                        searchEngine: 'elasticsearch',
                        version: '7',
                        connect: {
                            host: 'http://example.com'
                        }
                    })
                };
            });
            const config = {
                elasticsearch: {
                    searchEngine: 'elasticsearch',
                    version: '7',
                    connect: {
                        host: 'http://localhost:9202'
                    }
                },
                migration: {
                    location: `${process.cwd()}/src/__mocks__/testsData/migration`,
                    baselineVersion: {
                        test2: 'v1.0.0'
                    }
                }
            } as Required<MigrationConfig>;
            const service = migrationPlanService('test2', defaultPlanExecutionConfig(), config);

            await expect(service.refresh()).rejects.toThrowError(new Error('Response Error'));
        });

        it('throw error when the client throws an index_not_found_exception ', async () => {
            jest.spyOn(spec, 'migrateHistorySpecByIndexName').mockImplementationOnce(() => ({
                condition: {
                    index: 'hoge'
                }
            }));
            mocked(useElasticsearchClient).mockImplementation(() => {
                const { useElasticsearchClient } = jest.requireActual(
                    '../../client/es/ElasticsearchClient'
                );
                return {
                    ...useElasticsearchClient({
                        searchEngine: 'elasticsearch',
                        version: '7',
                        connect: {
                            host: 'http://localhost:9202'
                        }
                    })
                };
            });
            const config = {
                elasticsearch: {
                    searchEngine: 'elasticsearch',
                    version: '7',
                    connect: {
                        host: 'http://localhost:9202'
                    }
                },
                migration: {
                    location: `${process.cwd()}/src/__mocks__/testsData/migration`,
                    baselineVersion: {
                        test2: 'v1.0.0'
                    }
                }
            } as Required<MigrationConfig>;
            const service = migrationPlanService('test2', defaultPlanExecutionConfig(), config);

            await expect(service.refresh()).rejects.toThrowError(
                new Error(
                    'History index not found.\n' +
                        'Please check if migrate_history exists in Elasticsearch.'
                )
            );
        });
    });
});
