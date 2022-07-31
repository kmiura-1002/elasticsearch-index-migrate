import { ParsedPath } from 'path';
import { Document } from '../client/es/types';

// TODO: rename?
export const MIGRATE_HISTORY_INDEX_NAME = 'migrate_history';
export const MIGRATION_LOCK_INDEX_NAME = 'migration_lock';

/** @deprecated To be deleted */
const ELASTICSEARCH_VERSIONS = ['6.x', '7.x', 'opensearch'] as const;
/** @deprecated To be deleted */
export type ELASTICSEARCH_VERSION = typeof ELASTICSEARCH_VERSIONS[number];
export const OPENSEARCH = 'opensearch';
export const ELASTICSEARCH = 'elasticsearch';
const searchEngines = ['opensearch', 'elasticsearch'] as const;
export type SearchEngine = typeof searchEngines[number];

export interface ESConnectConfig {
    host?: string;
    sslCa?: string;
    cloudId?: string;
    username?: string;
    password?: string;
    insecure?: boolean;
}

export type Engine = {
    searchEngine: SearchEngine;
    version: string;
};

export type ESConfig = {
    searchEngine: SearchEngine;
    version: string;
    connect: ESConnectConfig;
};

export type MigrationTargetConfig = {
    location: string;
    baselineVersions?: {
        [key: string]: string; // index name or template name : version
    };
    baselineVersion?: string;
    historyIndexRequestBody?: SimpleJson;
    lockIndexRequestBody?: SimpleJson;
};

export type MigrationConfig = {
    elasticsearch?: ESConfig;
    migration?: MigrationTargetConfig;
};

export type MigrationPlanData = {
    resolvedMigration?: RequiredMigrationData;
    appliedMigration?: AppliedMigration;
    baseline: Version;
    lastResolved: Version;
    lastApplied: Version;
    type?: MigrationType;
    version?: string;
    description?: string;
    installedOn?: Date;
    state?: MigrationStateInfo;
    isBaseline: boolean;
    checksum: string | undefined;
};

export type MigrationExplainPlan = {
    all: MigrationPlanData[];
    pending: MigrationPlanData[];
};

export const ClusterStatuses = { GREEN: 'green', YELLOW: 'yellow', RED: 'red' } as const;
// export type ClusterStatus = typeof ClusterStatuses[keyof typeof ClusterStatuses];

export type IndexSearchResults6<T> = {
    hits: {
        total: number;
        max_score?: number;
        hits: Document<T>[];
    };
};

export type IndexSearchResults7<T> = {
    total: number;
    max_score?: number;
    hits: Document<T>[];
};

export type MigrationIndex = {
    index_name: string;
    migrate_version: Version;
    description: string;
    script_name: string;
    script_type: string;
    installed_on: string;
    execution_time: number;
    success: boolean;
    checksum: string | undefined;
};

export type LockIndex = {
    create: Date;
    command: string;
};

export const MigrationTypes = {
    BASELINE: 'BASELINE',
    ADD_FIELD: 'ADD_FIELD',
    CREATE_INDEX: 'CREATE_INDEX',
    DELETE_INDEX: 'DELETE_INDEX',
    ALTER_SETTING: 'ALTER_SETTING',
    TEMPLATE: 'TEMPLATE',
    INDEX_TEMPLATE: 'INDEX_TEMPLATE',
    COMPONENT_TEMPLATE: 'COMPONENT_TEMPLATE'
} as const;

export type MigrationType = typeof MigrationTypes[keyof typeof MigrationTypes];

export type MigrationFile = {
    type: MigrationType;
    description?: string;
    migrate_script?: any;
    query_parameters?: any;
};

export type RequiredMigrationData = {
    file: MigrationFile;
    version: Version;
    physicalLocation: ParsedPath;
    checksum: string;
};

export type MigrationData = {
    file: MigrationFile;
    version: Version | undefined;
    physicalLocation: ParsedPath;
    checksum: string;
};

export type AppliedMigration = {
    version: Version;
    description: string;
    type: MigrationType;
    script: string;
    installedOn: Date;
    executionTime: number;
    success: boolean;
    checksum: string | undefined;
};

export type MigrationExecuteConfig = {
    outOfOrder: boolean;
    pending: boolean;
    missing: boolean;
    ignored: boolean;
    future: boolean;
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

export const MigrationStateInfoMap: Map<MigrationState, MigrationStateInfo> = new Map([
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

export type SearchEngineVersion = ElasticsearchVersions | OpenSearchVersions;

type Major = number;
type Minor = number;
type Patch = number;

export type ElasticsearchVersions = {
    engine: 'Elasticsearch';
    major: Major;
    minor: Minor;
    patch: Patch;
};

export type OpenSearchVersions = {
    engine: 'OpenSearch';
    major: Major;
    minor: Minor;
    patch: Patch;
};

// version format type (Ex: v1.0.0)
export type Version = `v${Major}.${Minor}.${Patch}`;

export type CommandCommonFlagsProps = {
    search_engine: SearchEngine;
    elasticsearch_version: string;
    elasticsearch_host: string | undefined;
    elasticsearch_ssl: string | undefined;
    elasticsearch_cloudid: string | undefined;
    elasticsearch_username: string | undefined;
    elasticsearch_password: string | undefined;
    option_file: string | undefined;
};
