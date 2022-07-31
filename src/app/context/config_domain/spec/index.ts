import { Config } from '@oclif/core';
import fs from 'fs';
import { CommandCommonFlagsProps } from '../../../types';
import { NotFindToolConfigurationError } from '../../../error/notFindToolConfigurationError';

export type ToolConfigSpecProps = {
    flags: { [name: string]: any };
    config: Config;
};
export class ToolConfigSpec implements ToolConfigSpecProps {
    private readonly _flags: { [name: string]: any };
    private readonly _config: Config;
    constructor(flags: { [name: string]: any }, config: Config) {
        this._flags = flags;
        this._config = config;
    }

    get config(): Config {
        return this._config;
    }
    get flags(): { [p: string]: any } {
        return this._flags;
    }
    get optionFile(): string {
        if (!this._flags.option_file) {
            throw new NotFindToolConfigurationError('Configuration not found');
        }
        return this._flags.option_file;
    }

    get hasElasticsearchConnectionConfInEnv(): boolean {
        const {
            elasticsearch_host,
            elasticsearch_ssl,
            elasticsearch_cloudid,
            elasticsearch_username,
            elasticsearch_password
        } = this._flags as CommandCommonFlagsProps;

        return !!(
            (elasticsearch_ssl && elasticsearch_host) ||
            elasticsearch_host ||
            (elasticsearch_cloudid && elasticsearch_username && elasticsearch_password)
        );
    }

    get hasOptionFlag(): boolean {
        const { option_file } = this._flags as CommandCommonFlagsProps;
        return !!option_file;
    }

    get hasOclifConfig(): boolean {
        return !!this._config.configDir && fs.readdirSync(this._config.configDir).length > 0;
    }
}
