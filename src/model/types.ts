import { ParsedPath } from 'path';
import { ApiResponse as ApiResponse6 } from 'es6';
import { ApiResponse as ApiResponse7 } from 'es7';

export const VERSION_REGEX = /^([v][0-9]+.[0-9]+.[0-9]+)/;

export type ApiResponse<T = any, C = any> = ApiResponse6<T, C> | ApiResponse7<T, C>;
export const MAPPING_HISTORY_INDEX_NAME = 'migrate_history';
export interface ESConnectConfig {
    host?: string;
    sslCa?: string;
    cloudId?: string;
    username?: string;
    password?: string;
}
export type ESConfig = {
    version?: string;
    connect: ESConnectConfig;
};
export type MigrationConfigType = {
    elasticsearch: ESConfig;
    migration: {
        locations?: string[];
        baselineVersion?: string;
    };
};
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
    index_name: string;
    migrate_version: string;
    description: string;
    script_name: string;
    script_type: string;
    installed_on: string;
    execution_time: number;
    success: boolean;
};

export enum MigrationType {
    ADD_FIELD = 'ADD_FIELD',
    CREATE_INDEX = 'CREATE_INDEX'
}

export type ResolvedMigration = {
    type: MigrationType;
    index_name: string;
    version: string;
    description: string;
    physicalLocation: ParsedPath;
    migrate_script: any;
};

export type AppliedMigration = {
    version: string;
    description: string;
    type: MigrationType;
    script: string;
    installedOn: Date;
    executionTime: number;
    success: boolean;
};

export type MigrationInfoContext = {
    // outOfOrder: boolean;
    // pending: boolean;
    // missing: boolean;
    // ignored: boolean;
    // future: boolean;
    baseline: string;
    lastResolved: string;
    lastApplied: string;
};

export type MigrationInfoDetail = {
    version: string;
    description: string;
    type: string;
    installedOn: string;
    state: string;
};

export type MigrationStateInfo = {
    status: MigrationState;
    displayName: string;
    resolved: boolean;
    applied: boolean;
    failed: boolean;
};

export enum MigrationState {
    PENDING = 'PENDING',
    BELOW_BASELINE = 'BELOW_BASELINE',
    IGNORED = 'IGNORED',
    MISSING_SUCCESS = 'MISSING_SUCCESS',
    MISSING_FAILED = 'MISSING_FAILED',
    SUCCESS = 'SUCCESS',
    FAILED = 'FAILED',
    OUT_OF_ORDER = 'OUT_OF_ORDER',
    FUTURE_SUCCESS = 'FUTURE_SUCCESS',
    FUTURE_FAILED = 'FUTURE_FAILED'
}

export const MigrationStateInfo: Map<MigrationState, MigrationStateInfo> = new Map([
    [
        MigrationState.BELOW_BASELINE,
        {
            status: MigrationState.BELOW_BASELINE,
            displayName: 'Below Baseline',
            resolved: true,
            applied: false,
            failed: false
        }
    ],
    [
        MigrationState.FAILED,
        {
            status: MigrationState.FAILED,
            displayName: 'Failed',
            resolved: true,
            applied: true,
            failed: true
        }
    ],
    [
        MigrationState.FUTURE_FAILED,
        {
            status: MigrationState.FUTURE_FAILED,
            displayName: 'Failed (Future)',
            resolved: false,
            applied: true,
            failed: true
        }
    ],
    [
        MigrationState.FUTURE_SUCCESS,
        {
            status: MigrationState.FUTURE_SUCCESS,
            displayName: 'Future',
            resolved: false,
            applied: true,
            failed: false
        }
    ],
    [
        MigrationState.IGNORED,
        {
            status: MigrationState.IGNORED,
            displayName: 'Ignored',
            resolved: true,
            applied: false,
            failed: false
        }
    ],
    [
        MigrationState.MISSING_FAILED,
        {
            status: MigrationState.MISSING_FAILED,
            displayName: 'Failed (Missing)',
            resolved: false,
            applied: true,
            failed: true
        }
    ],
    [
        MigrationState.MISSING_SUCCESS,
        {
            status: MigrationState.MISSING_SUCCESS,
            displayName: 'Missing',
            resolved: true,
            applied: true,
            failed: false
        }
    ],
    [
        MigrationState.OUT_OF_ORDER,
        {
            status: MigrationState.OUT_OF_ORDER,
            displayName: 'Out of Order',
            resolved: true,
            applied: true,
            failed: false
        }
    ],
    [
        MigrationState.PENDING,
        {
            status: MigrationState.PENDING,
            displayName: 'Pending',
            resolved: true,
            applied: false,
            failed: false
        }
    ],
    [
        MigrationState.SUCCESS,
        {
            status: MigrationState.SUCCESS,
            displayName: 'Success',
            resolved: true,
            applied: true,
            failed: false
        }
    ]
]);
