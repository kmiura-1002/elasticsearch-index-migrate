import { readOptions } from '../../../src/flags/flagsLoader';
import * as Config from '@oclif/config';
import { expect } from 'chai';

describe('readOptions', () => {
    it('can be return MigrationConfig when connect with ssl ', async () => {
        const actual = await readOptions(
            {
                migration_locations: 'migration_locations',
                baseline_version: 'baseline_version',
                elasticsearch_version: 'elasticsearch_version',
                elasticsearch_ssl: 'elasticsearch_ssl',
                elasticsearch_host: 'elasticsearch_host'
            },
            {} as Config.IConfig
        );
        expect(actual).to.deep.equal({
            elasticsearch: {
                connect: {
                    cloudId: undefined,
                    host: 'elasticsearch_host',
                    password: undefined,
                    sslCa: 'elasticsearch_ssl',
                    username: undefined
                },
                version: 'elasticsearch_version'
            },
            migration: {
                baselineVersion: 'baseline_version',
                locations: ['migration_locations']
            }
        });
    });

    it('can be return MigrationConfig when connect with host ', async () => {
        const actual = await readOptions(
            {
                migration_locations: 'migration_locations',
                baseline_version: 'baseline_version',
                elasticsearch_version: 'elasticsearch_version',
                elasticsearch_host: 'elasticsearch_host'
            },
            {} as Config.IConfig
        );
        expect(actual).to.deep.equal({
            elasticsearch: {
                connect: {
                    cloudId: undefined,
                    host: 'elasticsearch_host',
                    password: undefined,
                    sslCa: undefined,
                    username: undefined
                },
                version: 'elasticsearch_version'
            },
            migration: {
                baselineVersion: 'baseline_version',
                locations: ['migration_locations']
            }
        });
    });

    it('can be return MigrationConfig when connect with cloud id and user name, password ', async () => {
        const actual = await readOptions(
            {
                migration_locations: 'migration_locations',
                baseline_version: 'baseline_version',
                elasticsearch_version: 'elasticsearch_version',
                elasticsearch_cloudid: 'elasticsearch_cloudid',
                elasticsearch_username: 'elasticsearch_username',
                elasticsearch_password: 'elasticsearch_password'
            },
            {} as Config.IConfig
        );
        expect(actual).to.deep.equal({
            elasticsearch: {
                connect: {
                    cloudId: 'elasticsearch_cloudid',
                    host: undefined,
                    password: 'elasticsearch_password',
                    sslCa: undefined,
                    username: 'elasticsearch_username'
                },
                version: 'elasticsearch_version'
            },
            migration: {
                baselineVersion: 'baseline_version',
                locations: ['migration_locations']
            }
        });
    });

    it('can be return MigrationConfig when connect with option_file and cloud id, user name, password ', async () => {
        const actual = await readOptions(
            {
                elasticsearch_version: 'elasticsearch_version',
                elasticsearch_cloudid: 'elasticsearch_cloudid',
                elasticsearch_username: 'elasticsearch_username',
                elasticsearch_password: 'elasticsearch_password',
                option_file: `${process.cwd()}/test/data/test.config.json`
            },
            {} as Config.IConfig
        );
        expect(actual).to.deep.equal({
            elasticsearch: {
                connect: {
                    cloudId: 'elasticsearch_cloudid',
                    host: 'http://0.0.0.0:9202',
                    password: 'elasticsearch_password',
                    sslCa: undefined,
                    username: 'elasticsearch_username'
                },
                version: '6'
            },
            migration: {
                baselineVersion: 'v1.0.0',
                locations: ['migration']
            }
        });
    });

    it('can be return MigrationConfig when connect with option_file and host', async () => {
        const actual = await readOptions(
            {
                elasticsearch_version: 'elasticsearch_version',
                elasticsearch_host: 'elasticsearch_host',
                option_file: `${process.cwd()}/test/data/test.config.json`
            },
            {} as Config.IConfig
        );
        expect(actual).to.deep.equal({
            elasticsearch: {
                connect: {
                    cloudId: undefined,
                    host: 'http://0.0.0.0:9202',
                    password: undefined,
                    sslCa: undefined,
                    username: undefined
                },
                version: '6'
            },
            migration: {
                baselineVersion: 'v1.0.0',
                locations: ['migration']
            }
        });
    });

    it('can be return MigrationConfig when connect with option_file and ssl, host', async () => {
        const actual = await readOptions(
            {
                elasticsearch_version: 'elasticsearch_version',
                elasticsearch_ssl: 'elasticsearch_ssl',
                elasticsearch_host: 'elasticsearch_host',
                option_file: `${process.cwd()}/test/data/test.config.json`
            },
            {} as Config.IConfig
        );
        expect(actual).to.deep.equal({
            elasticsearch: {
                connect: {
                    cloudId: undefined,
                    host: 'http://0.0.0.0:9202',
                    password: undefined,
                    sslCa: 'elasticsearch_ssl',
                    username: undefined
                },
                version: '6'
            },
            migration: {
                baselineVersion: 'v1.0.0',
                locations: ['migration']
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
            { configDir: `${process.cwd()}/test/data` } as Config.IConfig
        );
        expect(actual).to.deep.equal({
            elasticsearch: {
                connect: {
                    cloudId: undefined,
                    host: 'http://0.0.0.0:9202',
                    password: undefined,
                    sslCa: 'elasticsearch_ssl',
                    username: undefined
                },
                version: '6'
            },
            migration: {
                baselineVersion: 'v1.0.0',
                locations: ['migration']
            }
        });
    });

    it('can be return MigrationConfig when connect with config and  host', async () => {
        const actual = await readOptions(
            {
                elasticsearch_version: 'elasticsearch_version',
                elasticsearch_host: 'elasticsearch_host'
            },
            { configDir: `${process.cwd()}/test/data` } as Config.IConfig
        );
        expect(actual).to.deep.equal({
            elasticsearch: {
                connect: {
                    cloudId: undefined,
                    host: 'http://0.0.0.0:9202',
                    password: undefined,
                    sslCa: undefined,
                    username: undefined
                },
                version: '6'
            },
            migration: {
                baselineVersion: 'v1.0.0',
                locations: ['migration']
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
            { configDir: `${process.cwd()}/test/data` } as Config.IConfig
        );
        expect(actual).to.deep.equal({
            elasticsearch: {
                connect: {
                    cloudId: 'elasticsearch_cloudid',
                    host: 'http://0.0.0.0:9202',
                    password: 'elasticsearch_password',
                    sslCa: undefined,
                    username: 'elasticsearch_username'
                },
                version: '6'
            },
            migration: {
                baselineVersion: 'v1.0.0',
                locations: ['migration']
            }
        });
    });
    it('can be return MigrationConfig when connect with option_file', async () => {
        const actual = await readOptions({}, {
            configDir: `${process.cwd()}/test/data`
        } as Config.IConfig);
        expect(actual).to.deep.equal({
            elasticsearch: {
                connect: {
                    host: 'http://0.0.0.0:9202'
                },
                version: '6'
            },
            migration: {
                baselineVersion: 'v1.0.0',
                locations: ['migration']
            }
        });
    });

    it('can be return MigrationConfig when connect with config', async () => {
        const actual = await readOptions(
            { option_file: `${process.cwd()}/test/data/test.config.json` },
            {} as Config.IConfig
        );
        expect(actual).to.deep.equal({
            elasticsearch: {
                connect: {
                    host: 'http://0.0.0.0:9202'
                },
                version: '6'
            },
            migration: {
                baselineVersion: 'v1.0.0',
                locations: ['migration']
            }
        });
    });

    it('can not be return MigrationConfig', async () => {
        try {
            await readOptions({}, { configDir: '' } as Config.IConfig);
        } catch (e) {
            expect(e).to.eq(
                'No config. You can specify environment variables or files with the -O option and place config.json in ~/.config/elasticsearch-index-migrate. You should set one of these.'
            );
        }
    });
});
