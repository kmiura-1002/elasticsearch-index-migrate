import { ParsedPath } from 'path';
import { ApiResponse as ApiResponse6 } from 'es6';
import { ApiResponse as ApiResponse7 } from 'es7';
import { MigrationPlan } from '../executor/plan/MigrationPlan';

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
        locations: string[];
        baselineVersion: string;
    };
};

export const ClusterStatuses = { GREEN: 'green', YELLOW: 'yellow', RED: 'red' } as const;
// export type ClusterStatus = typeof ClusterStatuses[keyof typeof ClusterStatuses];

export type IndexSearchResults6<T> = {
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

export type IndexSearchResults7<T> = {
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
export const MigrationTypes = {
    ADD_FIELD: 'ADD_FIELD',
    CREATE_INDEX: 'CREATE_INDEX',
    DELETE_INDEX: 'DELETE_INDEX',
    ALTER_SETTING: 'ALTER_SETTING'
} as const;

export type MigrationType = typeof MigrationTypes[keyof typeof MigrationTypes];

export type ResolvedMigration = {
    type: MigrationType;
    version: string;
    description?: string;
    physicalLocation: ParsedPath;
    migrate_script?: any;
    query_parameters?: any;
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

export type MigrationPlanContext = {
    // outOfOrder: boolean;
    // pending: boolean;
    // missing: boolean;
    // ignored: boolean;
    // future: boolean;
    baseline: string;
    lastResolved: string;
    lastApplied: string;
};

export type MigrationPlanDetail = {
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

export const MigrationStates = {
    PENDING: 'PENDING',
    BASELINE: 'BASELINE',
    BELOW_BASELINE: 'BELOW_BASELINE',
    IGNORED: 'IGNORED',
    MISSING_SUCCESS: 'MISSING_SUCCESS',
    MISSING_FAILED: 'MISSING_FAILED',
    SUCCESS: 'SUCCESS',
    FAILED: 'FAILED',
    FUTURE_SUCCESS: 'FUTURE_SUCCESS',
    FUTURE_FAILED: 'FUTURE_FAILED'
} as const;

export type MigrationState = typeof MigrationStates[keyof typeof MigrationStates];

export const MigrationStateInfo: Map<MigrationState, MigrationStateInfo> = new Map([
    [
        MigrationStates.BASELINE,
        {
            status: MigrationStates.BASELINE,
            displayName: 'Baseline',
            resolved: true,
            applied: false,
            failed: false
        }
    ],
    [
        MigrationStates.BELOW_BASELINE,
        {
            status: MigrationStates.BELOW_BASELINE,
            displayName: 'Below Baseline',
            resolved: true,
            applied: false,
            failed: false
        }
    ],
    [
        MigrationStates.FAILED,
        {
            status: MigrationStates.FAILED,
            displayName: 'Failed',
            resolved: true,
            applied: true,
            failed: true
        }
    ],
    [
        MigrationStates.FUTURE_FAILED,
        {
            status: MigrationStates.FUTURE_FAILED,
            displayName: 'Failed (Future)',
            resolved: false,
            applied: true,
            failed: true
        }
    ],
    [
        MigrationStates.FUTURE_SUCCESS,
        {
            status: MigrationStates.FUTURE_SUCCESS,
            displayName: 'Future',
            resolved: false,
            applied: true,
            failed: false
        }
    ],
    [
        MigrationStates.IGNORED,
        {
            status: MigrationStates.IGNORED,
            displayName: 'Ignored',
            resolved: true,
            applied: false,
            failed: false
        }
    ],
    [
        MigrationStates.MISSING_FAILED,
        {
            status: MigrationStates.MISSING_FAILED,
            displayName: 'Failed (Missing)',
            resolved: false,
            applied: true,
            failed: true
        }
    ],
    [
        MigrationStates.MISSING_SUCCESS,
        {
            status: MigrationStates.MISSING_SUCCESS,
            displayName: 'Missing',
            resolved: true,
            applied: true,
            failed: false
        }
    ],
    [
        MigrationStates.PENDING,
        {
            status: MigrationStates.PENDING,
            displayName: 'Pending',
            resolved: true,
            applied: false,
            failed: false
        }
    ],
    [
        MigrationStates.SUCCESS,
        {
            status: MigrationStates.SUCCESS,
            displayName: 'Success',
            resolved: true,
            applied: true,
            failed: false
        }
    ]
]);

export type MigrationPlanExecutorRet = {
    all: MigrationPlan[];
    pending: MigrationPlan[];
};

type EmptyObject = {
    [K in any]: never;
};

export type JsonPrimitiveType = boolean | number | string | null | undefined | EmptyObject;

export type JsonArrayType = JsonPrimitiveType[] | JsonObjectType[];

export type JsonObjectType = {
    [key: string]: JsonPrimitiveType | JsonObjectType | JsonArrayType;
};

export type SimpleJson = JsonPrimitiveType | JsonArrayType | JsonObjectType;

export const cleanTargets = ['history', 'index', 'all'] as const;

export type CLEAN_TARGET = typeof cleanTargets[number];

export type ElasticsearchVersions = {
    major: number;
    minor: number;
    patch: number;
};
