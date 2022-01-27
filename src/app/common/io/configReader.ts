import { MigrationConfig } from '../../types';
import path from 'path';
import yaml from 'js-yaml';
import fs from 'fs';
import { loadJSON } from '@oclif/config/lib/util';
import * as Config from '@oclif/config';
import { createSchema as S, TsjsonParser } from 'ts-json-validator';

const configParser = new TsjsonParser(
    S({
        type: 'object',
        maxProperties: 2,
        additionalProperties: S(false),
        properties: {
            elasticsearch: S({
                type: 'object',
                maxProperties: 3,
                properties: {
                    searchEngine: S({
                        type: 'string',
                        enum: ['opensearch', 'elasticsearch'] as const
                    }),
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
                },
                required: ['searchEngine', 'version', 'connect']
            }),
            migration: S({
                type: 'object',
                maxProperties: 3,
                properties: {
                    location: S({ type: 'string' }),
                    baselineVersion: S({
                        type: 'object',
                        propertyNames: S({
                            type: 'string'
                        }),
                        additionalProperties: S({ type: 'string' })
                    }),
                    historyIndexRequestBody: S({ type: 'object' })
                },
                required: ['location', 'baselineVersion']
            })
        }
    }),
    { removeAdditional: true }
);

export const readConfig = async (filePath: string): Promise<MigrationConfig> => {
    const extension = path.extname(filePath);
    let config;
    if (extension === '.yaml' || extension === '.yml') {
        config = yaml.load(fs.readFileSync(filePath, 'utf8'));
    } else if (extension === '.json') {
        config = await loadJSON(filePath);
    } else {
        return Promise.reject(
            `Incorrect file. The configuration file must be yaml or json. This file is ${extension}`
        );
    }
    if (!configParser.validates(config)) {
        return Promise.reject('There is an invalid config item.');
    }
    return config;
};

export const readOclifConfig = async (config: Config.IConfig): Promise<MigrationConfig> => {
    let migrateCnf;
    if (fs.existsSync(path.join(config.configDir, 'config.yaml'))) {
        migrateCnf = yaml.load(fs.readFileSync(path.join(config.configDir, 'config.yaml'), 'utf8'));
    } else if (fs.existsSync(path.join(config.configDir, 'config.yml'))) {
        migrateCnf = yaml.load(fs.readFileSync(path.join(config.configDir, 'config.yml'), 'utf8'));
    } else if (fs.existsSync(path.join(config.configDir, 'config.json'))) {
        migrateCnf = await loadJSON(path.join(config.configDir, 'config.json'));
    } else {
        return Promise.reject(
            `There is no configuration file that can be loaded into ${config.configDir}. The configuration file must be yaml or json.`
        );
    }
    if (!configParser.validates(migrateCnf)) {
        return Promise.reject('There is an invalid config item.');
    }
    return migrateCnf;
};
