import * as Config from '@oclif/core';
import { toolConfigRepository } from '../toolConfigRepository';
import { ToolConfigSpec } from '../spec';
import { UnsupportedFileError } from '../../../error/unsupportedFileError';

describe('toolConfigRepository', () => {
    const { findBy } = toolConfigRepository();

    it('can be return MigrationConfig when connect with option_file and cloud id, user name, password ', async () => {
        const spec = new ToolConfigSpec(
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
        const actual = await findBy(spec);

        expect(actual.allMigrationConfig).toEqual({
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

    it('can be read config file when extension is .json', async () => {
        const spec = new ToolConfigSpec(
            {
                search_engine: 'elasticsearch',
                option_file: `${process.cwd()}/src/__mocks__/testsData/test_config/json/config.json`
            },
            {} as Config.Config
        );
        const actual = await findBy(spec);

        expect(actual.allMigrationConfig).toEqual({
            elasticsearch: {
                connect: {
                    host: 'http://0.0.0.0:9201'
                },
                searchEngine: 'elasticsearch',
                version: '6'
            },
            migration: {
                baselineVersions: {
                    test_index1: 'v1.0.0',
                    test_index2: 'v1.0.0'
                },
                location: 'migration'
            }
        });
    });

    it('can be read config file when extension is .yaml', async () => {
        const spec = new ToolConfigSpec(
            {
                search_engine: 'elasticsearch',
                option_file: `${process.cwd()}/src/__mocks__/testsData/test_config/yaml/config.yaml`
            },
            {} as Config.Config
        );
        const actual = await findBy(spec);

        expect(actual.allMigrationConfig).toEqual({
            elasticsearch: {
                connect: {
                    host: 'http://0.0.0.0:9202'
                },
                searchEngine: 'elasticsearch',
                version: '6.8.12'
            },
            migration: {
                baselineVersions: {
                    test_index1: 'v1.0.0',
                    test_index2: 'v1.0.0'
                },
                location: '/migration'
            }
        });
    });

    it('can be read config file when extension is .yml', async () => {
        const spec = new ToolConfigSpec(
            {
                search_engine: 'elasticsearch',
                option_file: `${process.cwd()}/src/__mocks__/testsData/test_config/yml/config.yml`
            },
            {} as Config.Config
        );
        const actual = await findBy(spec);

        expect(actual.allMigrationConfig).toEqual({
            elasticsearch: {
                connect: {
                    host: 'http://0.0.0.0:9202'
                },
                searchEngine: 'elasticsearch',
                version: '6.8.12'
            },
            migration: {
                baselineVersion: 'v1.0.0',
                baselineVersions: {
                    test_index1: 'v1.0.0',
                    test_index2: 'v1.0.0'
                },
                location: '/migration'
            }
        });
    });

    it('can not read config file when extension is .js', async () => {
        const spec = new ToolConfigSpec(
            {
                search_engine: 'elasticsearch',
                option_file: `${process.cwd()}/src/__mocks__/testsData/test_config/other/config.js`
            },
            {} as Config.Config
        );
        const actual = findBy(spec);

        await expect(actual).rejects.toThrow(UnsupportedFileError);
        await expect(actual).rejects.toThrow(
            'Incorrect file. The configuration file must be yaml or json. This file is .js'
        );
    });

    it('can not read config file hen there is an unknown value ', async () => {
        const spec = new ToolConfigSpec(
            {
                search_engine: 'elasticsearch',
                option_file: `${process.cwd()}/src/__mocks__/testsData/test_config/unknown_props/config.yaml`
            },
            {} as Config.Config
        );
        const actual = findBy(spec);

        await expect(actual).rejects.toEqual('There is an invalid config item.');
    });

    it('can be read oclif config file when extension is .json', async () => {
        const spec = new ToolConfigSpec({}, {
            configDir: `${process.cwd()}/src/__mocks__/testsData/test_config/json/`
        } as Config.Config);
        const actual = await findBy(spec);

        expect(actual.allMigrationConfig).toEqual({
            elasticsearch: {
                connect: {
                    host: 'http://0.0.0.0:9201'
                },
                searchEngine: 'elasticsearch',
                version: '6'
            },
            migration: {
                baselineVersions: {
                    test_index1: 'v1.0.0',
                    test_index2: 'v1.0.0'
                },
                location: 'migration'
            }
        });
    });

    it('can be read oclif config file when extension is .yaml', async () => {
        const spec = new ToolConfigSpec({}, {
            configDir: `${process.cwd()}/src/__mocks__/testsData/test_config/yaml/`
        } as Config.Config);
        const actual = await findBy(spec);

        expect(actual.allMigrationConfig).toEqual({
            elasticsearch: {
                connect: {
                    host: 'http://0.0.0.0:9202'
                },
                searchEngine: 'elasticsearch',
                version: '6.8.12'
            },
            migration: {
                baselineVersions: {
                    test_index1: 'v1.0.0',
                    test_index2: 'v1.0.0'
                },
                location: '/migration'
            }
        });
    });

    it('can be read oclif config file when extension is .yml', async () => {
        const spec = new ToolConfigSpec({}, {
            configDir: `${process.cwd()}/src/__mocks__/testsData/test_config/yml/`
        } as Config.Config);
        const actual = await findBy(spec);

        expect(actual.allMigrationConfig).toEqual({
            elasticsearch: {
                connect: {
                    host: 'http://0.0.0.0:9202'
                },
                searchEngine: 'elasticsearch',
                version: '6.8.12'
            },
            migration: {
                baselineVersion: 'v1.0.0',
                baselineVersions: {
                    test_index1: 'v1.0.0',
                    test_index2: 'v1.0.0'
                },
                location: '/migration'
            }
        });
    });

    it('can not read oclif config file when extension is .js', async () => {
        const configDir = `${process.cwd()}/src/__mocks__/testsData/test_config/other/`;
        const spec = new ToolConfigSpec({}, {
            configDir
        } as Config.Config);
        const actual = findBy(spec);

        await expect(actual).rejects.toThrow(UnsupportedFileError);
        await expect(actual).rejects.toThrow(
            `There is no configuration file that can be loaded into ${configDir}. The configuration file must be yaml or json.`
        );
    });

    it('can not read oclif config file hen there is an unknown value ', async () => {
        const spec = new ToolConfigSpec({}, {
            configDir: `${process.cwd()}/src/__mocks__/testsData/test_config/unknown_props/`
        } as Config.Config);
        const actual = findBy(spec);

        await expect(actual).rejects.toEqual('There is an invalid config item.');
    });

    it('can be return MigrationConfig when connect with option_file and host', async () => {
        const spec = new ToolConfigSpec(
            {
                elasticsearch_version: 'elasticsearch_version',
                elasticsearch_host: 'elasticsearch_host',
                option_file: `${process.cwd()}/src/__mocks__/testsData/test.config.json`
            },
            {} as Config.Config
        );
        const actual = await findBy(spec);

        expect(actual.allMigrationConfig).toEqual({
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
        const spec = new ToolConfigSpec(
            {
                elasticsearch_version: 'elasticsearch_version',
                elasticsearch_ssl: 'elasticsearch_ssl',
                elasticsearch_host: 'elasticsearch_host',
                option_file: `${process.cwd()}/src/__mocks__/testsData/test.config.json`
            },
            {} as Config.Config
        );
        const actual = await findBy(spec);

        expect(actual.allMigrationConfig).toEqual({
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
        const spec = new ToolConfigSpec(
            {
                elasticsearch_version: 'elasticsearch_version',
                elasticsearch_ssl: 'elasticsearch_ssl',
                elasticsearch_host: 'elasticsearch_host'
            },
            { configDir: `${process.cwd()}/src/__mocks__/testsData` } as Config.Config
        );
        const actual = await findBy(spec);

        expect(actual.allMigrationConfig).toEqual({
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
        const spec = new ToolConfigSpec(
            {
                elasticsearch_version: 'elasticsearch_version',
                elasticsearch_host: 'elasticsearch_host'
            },
            { configDir: `${process.cwd()}/src/__mocks__/testsData` } as Config.Config
        );
        const actual = await findBy(spec);
        expect(actual.allMigrationConfig).toEqual({
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
        const spec = new ToolConfigSpec(
            {
                elasticsearch_version: 'elasticsearch_version',
                elasticsearch_cloudid: 'elasticsearch_cloudid',
                elasticsearch_username: 'elasticsearch_username',
                elasticsearch_password: 'elasticsearch_password'
            },
            { configDir: `${process.cwd()}/src/__mocks__/testsData` } as Config.Config
        );
        const actual = await findBy(spec);

        expect(actual.allMigrationConfig).toEqual({
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
        const spec = new ToolConfigSpec({}, {
            configDir: `${process.cwd()}/src/__mocks__/testsData`
        } as Config.Config);
        const actual = await findBy(spec);

        expect(actual.allMigrationConfig).toEqual({
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

    it('can not be return MigrationConfig', async () => {
        const spec = new ToolConfigSpec({}, { configDir: '' } as Config.Config);
        await expect(findBy(spec)).rejects.toThrowError(
            new Error(
                'No config. You can specify environment variables or files with the -O option and place config.json in ~/.config/elasticsearch-index-migrate. You should set one of these.'
            )
        );
    });
});
