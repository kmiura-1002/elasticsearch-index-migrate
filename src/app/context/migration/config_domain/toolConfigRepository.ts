import { toolConfigSpec, ToolConfigSpecByOclifConfig, ToolConfigSpecByPath } from './spec';
import path from 'path';
import yaml from 'js-yaml';
import fs from 'fs';
import { loadJSON } from '@oclif/core/lib/config/util';
import { Config } from '@oclif/core';
import { ToolConfigEntity } from './toolConfigEntity';

export function toolConfigRepository() {
    const findBy = <T>(spec: toolConfigSpec<T>) => {
        if (spec instanceof ToolConfigSpecByPath) {
            return readConfig((spec as ToolConfigSpecByPath).getPath());
        } else if (spec instanceof ToolConfigSpecByOclifConfig) {
            return readOclifConfig((spec as ToolConfigSpecByOclifConfig).getPath());
        } else {
            throw new Error();
        }
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
