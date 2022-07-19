import { readOptions } from '../flagsLoader';
import * as Config from '@oclif/core';

describe('readOptions', () => {
    it('can be return MigrationConfig when connect with option_file and cloud id, user name, password ', async () => {
        const actual = await readOptions(
            {
                search_engine: 'search_engine',
                elasticsearch_version: 'elasticsearch_version',
                elasticsearch_cloudid: 'elasticsearch_cloudid',
                elasticsearch_username: 'elasticsearch_username',
                elasticsearch_password: 'elasticsearch_password',
                option_file: `${process.cwd()}/src/__mocks__/testsData/test.config.json`
            },
            {} as Config.Config
        );
        expect(actual).toEqual({
            elasticsearch: {
                connect: {
                    cloudId: 'elasticsearch_cloudid',
                    host: 'http://0.0.0.0:9202',
                    password: 'elasticsearch_password',
                    sslCa: undefined,
                    username: 'elasticsearch_username'
                },
                searchEngine: 'elasticsearch',
                version: '6'
            },
            migration: {
                baselineVersions: {
                    test_index: 'v1.0.0'
                },
                location: 'migration'
            }
        });
    });

    it('can be return MigrationConfig when connect with option_file and host', async () => {
        const actual = await readOptions(
            {
                elasticsearch_version: 'elasticsearch_version',
                elasticsearch_host: 'elasticsearch_host',
                option_file: `${process.cwd()}/src/__mocks__/testsData/test.config.json`
            },
            {} as Config.Config
        );
        expect(actual).toEqual({
            elasticsearch: {
                connect: {
                    cloudId: undefined,
                    host: 'http://0.0.0.0:9202',
                    password: undefined,
                    sslCa: undefined,
                    username: undefined
                },
                searchEngine: 'elasticsearch',
                version: '6'
            },
            migration: {
                baselineVersions: {
                    test_index: 'v1.0.0'
                },
                location: 'migration'
            }
        });
    });

    it('can be return MigrationConfig when connect with option_file and ssl, host', async () => {
        const actual = await readOptions(
            {
                elasticsearch_version: 'elasticsearch_version',
                elasticsearch_ssl: 'elasticsearch_ssl',
                elasticsearch_host: 'elasticsearch_host',
                option_file: `${process.cwd()}/src/__mocks__/testsData/test.config.json`
            },
            {} as Config.Config
        );
        expect(actual).toEqual({
            elasticsearch: {
                connect: {
                    cloudId: undefined,
                    host: 'http://0.0.0.0:9202',
                    password: undefined,
                    sslCa: 'elasticsearch_ssl',
                    username: undefined
                },
                searchEngine: 'elasticsearch',
                version: '6'
            },
            migration: {
                baselineVersions: {
                    test_index: 'v1.0.0'
                },
                location: 'migration'
            }
        });
    });

    it('can be return MigrationConfig when connect with config and ssl, host', async () => {
        const actual = await readOptions(
            {
                elasticsearch_version: 'elasticsearch_version',
                elasticsearch_ssl: 'elasticsearch_ssl',
                elasticsearch_host: 'elasticsearch_host'
            },
            { configDir: `${process.cwd()}/src/__mocks__/testsData` } as Config.Config
        );
        expect(actual).toEqual({
            elasticsearch: {
                connect: {
                    cloudId: undefined,
                    host: 'http://0.0.0.0:9202',
                    password: undefined,
                    sslCa: 'elasticsearch_ssl',
                    username: undefined
                },
                searchEngine: 'elasticsearch',
                version: '6'
            },
            migration: {
                baselineVersions: {
                    test_index: 'v1.0.0'
                },
                location: 'migration'
            }
        });
    });

    it('can be return MigrationConfig when connect with config and  host', async () => {
        const actual = await readOptions(
            {
                elasticsearch_version: 'elasticsearch_version',
                elasticsearch_host: 'elasticsearch_host'
            },
            { configDir: `${process.cwd()}/src/__mocks__/testsData` } as Config.Config
        );
        expect(actual).toEqual({
            elasticsearch: {
                connect: {
                    cloudId: undefined,
                    host: 'http://0.0.0.0:9202',
                    password: undefined,
                    sslCa: undefined,
                    username: undefined
                },
                searchEngine: 'elasticsearch',
                version: '6'
            },
            migration: {
                baselineVersions: {
                    test_index: 'v1.0.0'
                },
                location: 'migration'
            }
        });
    });

    it('can be return MigrationConfig when connect with config and cloud id, user name, password ', async () => {
        const actual = await readOptions(
            {
                elasticsearch_version: 'elasticsearch_version',
                elasticsearch_cloudid: 'elasticsearch_cloudid',
                elasticsearch_username: 'elasticsearch_username',
                elasticsearch_password: 'elasticsearch_password'
            },
            { configDir: `${process.cwd()}/src/__mocks__/testsData` } as Config.Config
        );
        expect(actual).toEqual({
            elasticsearch: {
                connect: {
                    cloudId: 'elasticsearch_cloudid',
                    host: 'http://0.0.0.0:9202',
                    password: 'elasticsearch_password',
                    sslCa: undefined,
                    username: 'elasticsearch_username'
                },
                searchEngine: 'elasticsearch',
                version: '6'
            },
            migration: {
                baselineVersions: {
                    test_index: 'v1.0.0'
                },
                location: 'migration'
            }
        });
    });
    it('can be return MigrationConfig when connect with option_file', async () => {
        const actual = await readOptions({}, {
            configDir: `${process.cwd()}/src/__mocks__/testsData`
        } as Config.Config);
        expect(actual).toEqual({
            elasticsearch: {
                connect: {
                    host: 'http://0.0.0.0:9202'
                },
                searchEngine: 'elasticsearch',
                version: '6'
            },
            migration: {
                baselineVersions: {
                    test_index: 'v1.0.0'
                },
                location: 'migration'
            }
        });
    });

    it('can be return MigrationConfig when connect with config', async () => {
        const actual = await readOptions(
            { option_file: `${process.cwd()}/src/__mocks__/testsData/test.config.json` },
            {} as Config.Config
        );
        expect(actual).toEqual({
            elasticsearch: {
                connect: {
                    host: 'http://0.0.0.0:9202'
                },
                searchEngine: 'elasticsearch',
                version: '6'
            },
            migration: {
                baselineVersions: {
                    test_index: 'v1.0.0'
                },
                location: 'migration'
            }
        });
    });

    it('can not be return MigrationConfig when unknown format config file', async () => {
        await expect(
            readOptions(
                { option_file: `${process.cwd()}/src/__mocks__/testsData/unknown.config.json` },
                {} as Config.Config
            )
        ).rejects.toEqual('There is an invalid config item.');
    });

    it('can not be return MigrationConfig', async () => {
        try {
            await readOptions({}, { configDir: '' } as Config.Config);
        } catch (e) {
            expect(e).toEqual(
                'No config. You can specify environment variables or files with the -O option and place config.json in ~/.config/elasticsearch-index-migrate. You should set one of these.'
            );
        }
    });
});
