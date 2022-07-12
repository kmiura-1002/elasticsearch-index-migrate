import { Config } from '@oclif/core';

export interface toolConfigSpec<T> {
    getPath: () => T;
}

export class ToolConfigSpecByPath implements toolConfigSpec<string> {
    private readonly path: string;

    constructor(path: string) {
        this.path = path;
    }
    getPath(): string {
        return this.path;
    }
}

export class ToolConfigSpecByOclifConfig implements toolConfigSpec<Config> {
    private readonly path: Config;

    constructor(config: Config) {
        this.path = config;
    }
    getPath(): Config {
        return this.path;
    }
}
