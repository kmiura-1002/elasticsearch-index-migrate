import { ParsedPath } from 'path';
import { ApiResponse as ApiResponse6 } from 'es6';
import { ApiResponse as ApiResponse7 } from 'es7';

export type ApiResponse<T = any, C = any> = ApiResponse6<T, C> | ApiResponse7<T, C>;
export const MAPPING_HISTORY_INDEX_NAME = 'migrate_history';
export interface ESConfig {
    host?: string;
    sslCa?: string;
    cloudId?: string;
    username?: string;
    password?: string;
}
export enum clusterStatus {
    GREEN = 'green',
    YELLOW = 'yellow',
    RED = 'red'
}
export type IndexSearchResults<T> = {
    hits: {
        total: number;
        max_score?: number;
        hits: {
            _index: string;
            _type: string;
            _id: string;
            _score?: number;
            _source: T;
        }[];
    };
};

export type MigrateIndex = {
    installed_rank: number;
    index_name: string;
    migrate_version: string;
    description: string;
    script_name: string;
    script_type: MigrationType;
    installed_on: Date;
    execution_time: number;
    success: boolean;
};

export enum MigrationScriptType {
    ADD_FIELD = 'ADD_FIELD',
    CREATE_INDEX = 'CREATE_INDEX'
}

export enum MigrationType {
    INDEX = 'INDEX',
    MAPPING = 'MAPPING',
    SETTING = 'SETTING',
    TEMPLATE = 'TEMPLATE'
}

// TODO delete
export type MigrationScript = {
    type: MigrationScriptType;
    index_name: string;
    description: string;
    migrate_script: any;
};

// TODO Implement
export type MigrationExecutor = {
    execute(): void;
};

export type ResolvedMigration = {
    type: MigrationScriptType;
    index_name: string;
    version: string;
    description: string;
    physicalLocation: ParsedPath;
    migrate_script: any;
    // getExecutor(): MigrationExecutor;
};

export type AppliedMigration = {
    installedRank: number;
    version: string;
    description: string;
    type: MigrationType;
    script: string;
    installedOn: Date;
    // installedBy: string; // TODO remove?
    executionTime: number;
    success: boolean;
};

export type MigrationInfoContext = {
    outOfOrder: boolean;
    pending: boolean;
    missing: boolean;
    ignored: boolean;
    future: boolean;
    target: string;
    schema: string;
    baseline: string;
    lastResolved: string;
    lastApplied: string;
};

export type MigrationInfo = {
    resolvedMigration?: ResolvedMigration;
    appliedMigration?: AppliedMigration;
    outOfOrder: boolean;
    context: MigrationInfoContext;
};
