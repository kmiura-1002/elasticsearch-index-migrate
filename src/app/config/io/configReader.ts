import path from 'path';
import yaml from 'js-yaml';
import fs from 'fs';
import * as Config from '@oclif/core';
import { loadJSON } from '@oclif/core/lib/config/util';
import type { MigrationConfig } from '../../types';
import { isAssumedSetting } from '../../context/migration/config_domain/configSpecification';

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
    if (!isAssumedSetting(config)) {
        return Promise.reject('There is an invalid config item.');
    }
    return config;
};

export const readOclifConfig = async (config: Config.Config): Promise<MigrationConfig> => {
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
    if (!isAssumedSetting(migrateCnf)) {
        return Promise.reject('There is an invalid config item.');
    }
    return migrateCnf;
};
