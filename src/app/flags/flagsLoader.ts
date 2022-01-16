import merge from 'lodash.merge';
import { loadJSON } from '@oclif/config/lib/util';
import fs from 'fs';
import path from 'path';
import * as Config from '@oclif/config';
import { MigrationConfig } from '../types';
import { createSchema as S, TsjsonParser } from 'ts-json-validator';

const configParser = new TsjsonParser(
    S({
        type: 'object',
        maxProperties: 2,
        properties: {
            elasticsearch: S({
                type: 'object',
                maxProperties: 3,
                properties: {
                    searchEngine: S({ type: 'string' }),
                    version: S({ type: 'string' }),
                    connect: S({
                        type: 'object',
                        properties: {
                            host: S({ type: 'string' }),
                            sslCa: S({ type: 'string' }),
                            cloudId: S({ type: 'string' }),
                            username: S({ type: 'string' }),
                            password: S({ type: 'string' }),
                            insecure: S({ type: 'boolean' })
                        }
                    })
                }
            }),
            migration: S({
                type: 'object',
                maxProperties: 3,
                properties: {
                    locations: S({ type: 'array', title: 'This is field A' }),
                    baselineVersion: S({
                        if: S({ type: 'string' }),
                        else: S({
                            type: 'object'
                        })
                    }),
                    historyIndexRequestBody: S({ type: 'object' })
                }
            })
        }
    })
);

export const readOptions = async (
    flags: { [name: string]: any },
    config: Config.IConfig
): Promise<MigrationConfig> => {
    const {
        migration_locations,
        baseline_version,
        search_engine = 'elasticsearch',
        elasticsearch_version,
        elasticsearch_host,
        elasticsearch_ssl,
        elasticsearch_cloudid,
        elasticsearch_username,
        elasticsearch_password,
        option_file
    } = flags as any;
    if (
        migration_locations &&
        baseline_version &&
        search_engine &&
        elasticsearch_version &&
        ((elasticsearch_ssl && elasticsearch_host) ||
            elasticsearch_host ||
            (elasticsearch_cloudid && elasticsearch_username && elasticsearch_password))
    ) {
        return {
            elasticsearch: {
                connect: {
                    host: elasticsearch_host,
                    sslCa: elasticsearch_ssl,
                    cloudId: elasticsearch_cloudid,
                    username: elasticsearch_username,
                    password: elasticsearch_password
                },
                searchEngine: search_engine,
                version: elasticsearch_version
            },
            migration: {
                locations:
                    typeof migration_locations === 'string'
                        ? [migration_locations]
                        : migration_locations,
                baselineVersion: baseline_version
            }
        };
    } else if (
        ((elasticsearch_ssl && elasticsearch_host) ||
            elasticsearch_host ||
            (elasticsearch_cloudid && elasticsearch_username && elasticsearch_password)) &&
        option_file
    ) {
        if (!configParser.validates(await loadJSON(option_file))) {
            return Promise.reject('There is an invalid config item.');
        }
        return merge(
            {
                elasticsearch: {
                    connect: {
                        host: elasticsearch_host,
                        sslCa: elasticsearch_ssl,
                        cloudId: elasticsearch_cloudid,
                        username: elasticsearch_username,
                        password: elasticsearch_password
                    },
                    searchEngine: search_engine,
                    version: elasticsearch_version
                },
                migration: {
                    locations: [''],
                    baselineVersion: ''
                }
            },
            { ...(await loadJSON(option_file)) }
        );
    } else if (
        ((elasticsearch_ssl && elasticsearch_host) ||
            elasticsearch_host ||
            (elasticsearch_cloudid && elasticsearch_username && elasticsearch_password)) &&
        fs.existsSync(path.join(config.configDir, 'config.json'))
    ) {
        if (!configParser.validates(await loadJSON(path.join(config.configDir, 'config.json')))) {
            return Promise.reject('There is an invalid config item.');
        }
        return merge(
            {
                elasticsearch: {
                    connect: {
                        host: elasticsearch_host,
                        sslCa: elasticsearch_ssl,
                        cloudId: elasticsearch_cloudid,
                        username: elasticsearch_username,
                        password: elasticsearch_password
                    },
                    searchEngine: search_engine,
                    version: elasticsearch_version
                },
                migration: {
                    locations: [''],
                    baselineVersion: ''
                }
            },
            {
                ...(await loadJSON(path.join(config.configDir, 'config.json')))
            } as MigrationConfig
        );
    } else if (option_file) {
        if (!configParser.validates(await loadJSON(option_file))) {
            return Promise.reject('There is an invalid config item.');
        }
        return merge(
            {
                elasticsearch: {
                    searchEngine: search_engine
                }
            },
            { ...(await loadJSON(option_file)) }
        );
    } else if (fs.existsSync(path.join(config.configDir, 'config.json'))) {
        if (!configParser.validates(await loadJSON(path.join(config.configDir, 'config.json')))) {
            return Promise.reject('There is an invalid config item.');
        }
        return merge(
            {
                elasticsearch: {
                    searchEngine: search_engine
                }
            },
            {
                ...(await loadJSON(path.join(config.configDir, 'config.json')))
            } as MigrationConfig
        );
    } else {
        return Promise.reject(
            'No config. You can specify environment variables or files with the -O option and place config.json in ~/.config/elasticsearch-index-migrate. You should set one of these.'
        );
    }
};
