import { readConfig, readOclifConfig } from '../configReader';
import * as Config from '@oclif/core';

describe('configReader', () => {
    it('can be read config file when extension is .json', async () => {
        const actual = await readConfig(
            `${process.cwd()}/src/__mocks__/testsData/test_config/json/config.json`
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
                baselineVersion: {
                    test_index1: 'v1.0.0',
                    test_index2: 'v1.0.0'
                },
                location: 'migration'
            }
        });
    });

    it('can be read config file when extension is .yaml', async () => {
        const actual = await readConfig(
            `${process.cwd()}/src/__mocks__/testsData/test_config/yaml/config.yaml`
        );
        expect(actual).toEqual({
            elasticsearch: {
                connect: {
                    host: 'http://0.0.0.0:9202'
                },
                searchEngine: 'elasticsearch',
                version: '6.8.12'
            },
            migration: {
                baselineVersion: {
                    test_index1: 'v1.0.0',
                    test_index2: 'v1.0.0'
                },
                location: '/migration'
            }
        });
    });

    it('can be read config file when extension is .yml', async () => {
        const actual = await readConfig(
            `${process.cwd()}/src/__mocks__/testsData/test_config/yml/config.yml`
        );
        expect(actual).toEqual({
            elasticsearch: {
                connect: {
                    host: 'http://0.0.0.0:9202'
                },
                searchEngine: 'elasticsearch',
                version: '6.8.12'
            },
            migration: {
                baselineVersion: {
                    test_index1: 'v1.0.0',
                    test_index2: 'v1.0.0'
                },
                location: '/migration'
            }
        });
    });

    it('can not read config file when extension is .js', async () => {
        const actual = readConfig(
            `${process.cwd()}/src/__mocks__/testsData/test_config/other/config.js`
        );
        await expect(actual).rejects.toEqual(
            'Incorrect file. The configuration file must be yaml or json. This file is .js'
        );
    });

    it('can not read config file hen there is an unknown value ', async () => {
        const actual = readConfig(
            `${process.cwd()}/src/__mocks__/testsData/test_config/unknown_props/config.yaml`
        );
        await expect(actual).rejects.toEqual('There is an invalid config item.');
    });

    it('can be read oclif config file when extension is .json', async () => {
        const actual = await readOclifConfig({
            configDir: `${process.cwd()}/src/__mocks__/testsData/test_config/json/`
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
                baselineVersion: {
                    test_index1: 'v1.0.0',
                    test_index2: 'v1.0.0'
                },
                location: 'migration'
            }
        });
    });

    it('can be read oclif config file when extension is .yaml', async () => {
        const actual = await readOclifConfig({
            configDir: `${process.cwd()}/src/__mocks__/testsData/test_config/yaml/`
        } as Config.Config);
        expect(actual).toEqual({
            elasticsearch: {
                connect: {
                    host: 'http://0.0.0.0:9202'
                },
                searchEngine: 'elasticsearch',
                version: '6.8.12'
            },
            migration: {
                baselineVersion: {
                    test_index1: 'v1.0.0',
                    test_index2: 'v1.0.0'
                },
                location: '/migration'
            }
        });
    });

    it('can be read oclif config file when extension is .yml', async () => {
        const actual = await readOclifConfig({
            configDir: `${process.cwd()}/src/__mocks__/testsData/test_config/yml/`
        } as Config.Config);
        expect(actual).toEqual({
            elasticsearch: {
                connect: {
                    host: 'http://0.0.0.0:9202'
                },
                searchEngine: 'elasticsearch',
                version: '6.8.12'
            },
            migration: {
                baselineVersion: {
                    test_index1: 'v1.0.0',
                    test_index2: 'v1.0.0'
                },
                location: '/migration'
            }
        });
    });

    it('can not read oclif config file when extension is .js', async () => {
        const configDir = `${process.cwd()}/src/__mocks__/testsData/test_config/other/`;
        const actual = readOclifConfig({
            configDir
        } as Config.Config);
        await expect(actual).rejects.toEqual(
            `There is no configuration file that can be loaded into ${configDir}. The configuration file must be yaml or json.`
        );
    });

    it('can not read oclif config file hen there is an unknown value ', async () => {
        const actual = readOclifConfig({
            configDir: `${process.cwd()}/src/__mocks__/testsData/test_config/unknown_props/`
        } as Config.Config);
        await expect(actual).rejects.toEqual('There is an invalid config item.');
    });
});
