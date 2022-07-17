import { ToolConfigSpec, ToolConfigSpecProps } from './spec';
import path from 'path';
import yaml from 'js-yaml';
import fs from 'fs';
import { loadJSON } from '@oclif/core/lib/config/util';
import { Config } from '@oclif/core';
import { ToolConfigEntity } from './toolConfigEntity';
import { CommandCommonFlagsProps, MigrationConfig } from '../../types';
import merge from 'lodash.merge';

const isToolConfigSpec = (spec: ToolConfigSpecProps): spec is ToolConfigSpec => {
    const configSpec = spec as ToolConfigSpec;
    return (
        typeof configSpec.hasElasticsearchConnectionConfInEnv !== 'undefined' &&
        typeof configSpec.hasOptionFlag !== 'undefined' &&
        typeof configSpec.hasOclifConfig !== 'undefined'
    );
};

export function toolConfigRepository() {
    const findBy = async (spec: ToolConfigSpecProps): Promise<ToolConfigEntity> => {
        const {
            search_engine = 'elasticsearch',
            elasticsearch_version,
            elasticsearch_host,
            elasticsearch_ssl,
            elasticsearch_cloudid,
            elasticsearch_username,
            elasticsearch_password
        } = spec.flags as CommandCommonFlagsProps;
        if (isToolConfigSpec(spec)) {
            const esConfig: MigrationConfig = spec.hasElasticsearchConnectionConfInEnv
                ? {
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
                  }
                : {
                      elasticsearch: {
                          searchEngine: search_engine,
                          version: '',
                          connect: {}
                      }
                  };

            if (spec.hasOptionFlag) {
                const config = await readConfig(spec.optionFile);

                return returnConfig(merge(esConfig, config.allMigrationConfig));
            } else if (spec.hasOclifConfig) {
                const migrateCnf = await readOclifConfig(spec.config);

                return returnConfig(merge(esConfig, migrateCnf.allMigrationConfig));
            }
        }
        // FIXME
        throw new Error(
            'No config. You can specify environment variables or files with the -O option and place config.json in ~/.config/elasticsearch-index-migrate. You should set one of these.'
        );
    };

    const readConfig = async (filePath: string): Promise<ToolConfigEntity> => {
        const extension = path.extname(filePath);
        let config;
        if (extension === '.yaml' || extension === '.yml') {
            config = yaml.load(fs.readFileSync(filePath, 'utf8'));
        } else if (extension === '.json') {
            config = await loadJSON(filePath);
        } else {
            // FIXME
            return Promise.reject(
                `Incorrect file. The configuration file must be yaml or json. This file is ${extension}`
            );
        }

        return ToolConfigEntity.readConfig(config);
    };

    const readOclifConfig = async (config: Config): Promise<ToolConfigEntity> => {
        let migrateCnf;
        if (fs.existsSync(path.join(config.configDir, 'config.yaml'))) {
            migrateCnf = yaml.load(
                fs.readFileSync(path.join(config.configDir, 'config.yaml'), 'utf8')
            );
        } else if (fs.existsSync(path.join(config.configDir, 'config.yml'))) {
            migrateCnf = yaml.load(
                fs.readFileSync(path.join(config.configDir, 'config.yml'), 'utf8')
            );
        } else if (fs.existsSync(path.join(config.configDir, 'config.json'))) {
            migrateCnf = await loadJSON(path.join(config.configDir, 'config.json'));
        } else {
            // FIXME
            return Promise.reject(
                `There is no configuration file that can be loaded into ${config.configDir}. The configuration file must be yaml or json.`
            );
        }

        return ToolConfigEntity.readConfig(migrateCnf);
    };

    return {
        findBy
    };
}

function isRequiredConfig(param: MigrationConfig): param is Required<MigrationConfig> {
    return param.migration !== undefined && param.elasticsearch !== undefined;
}

const returnConfig = (config: MigrationConfig) => {
    if (isRequiredConfig(config)) {
        return ToolConfigEntity.readConfig(config);
    }
    // FIXME
    return Promise.reject('The elasticsearch or migrate settings are missing.');
};
