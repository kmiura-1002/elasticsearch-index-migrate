import merge from 'lodash.merge';
import fs from 'fs';
import * as Config from '@oclif/config';
import { MigrationConfig } from '../types';
import { readConfig, readOclifConfig } from '../config/io/configReader';
import { DeepRequired } from 'ts-essentials';

export const readOptions = async (
    flags: { [name: string]: any },
    config: Config.IConfig
): Promise<DeepRequired<MigrationConfig>> => {
    const {
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
        ((elasticsearch_ssl && elasticsearch_host) ||
            elasticsearch_host ||
            (elasticsearch_cloudid && elasticsearch_username && elasticsearch_password)) &&
        option_file
    ) {
        const esConfig: MigrationConfig = {
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
            }
        };
        const config = await readConfig(option_file);

        return returnConfig(merge(esConfig, config));
    } else if (
        ((elasticsearch_ssl && elasticsearch_host) ||
            elasticsearch_host ||
            (elasticsearch_cloudid && elasticsearch_username && elasticsearch_password)) &&
        config.configDir &&
        fs.readdirSync(config.configDir).length > 0
    ) {
        const esConfig: MigrationConfig = {
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
            }
        };
        const migrateCnf = await readOclifConfig(config);

        return returnConfig(merge(esConfig, migrateCnf));
    } else if (option_file) {
        const config = await readConfig(option_file);
        const esConfig: MigrationConfig = {
            elasticsearch: {
                searchEngine: search_engine,
                version: '',
                connect: {}
            }
        };
        return returnConfig(merge(esConfig, config));
    } else if (config.configDir && fs.readdirSync(config.configDir).length > 0) {
        const migrateCnf = await readOclifConfig(config);
        const esConfig: MigrationConfig = {
            elasticsearch: {
                searchEngine: search_engine,
                version: '',
                connect: {}
            }
        };
        return returnConfig(merge(esConfig, migrateCnf));
    } else {
        return Promise.reject(
            'No config. You can specify environment variables or files with the -O option and place config.json in ~/.config/elasticsearch-index-migrate. You should set one of these.'
        );
    }
};

function isRequiredConfig(param: MigrationConfig): param is DeepRequired<MigrationConfig> {
    return param.migration !== undefined && param.elasticsearch !== undefined;
}

const returnConfig = (config: MigrationConfig) => {
    if (isRequiredConfig(config)) {
        return config;
    }
    return Promise.reject('The elasticsearch or migrate settings are missing.');
};
