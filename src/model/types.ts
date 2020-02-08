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

export enum Migrationtype {
    ADD_FIELD = 'ADD_FIELD',
    CREATE_INDEX = 'CREATE_INDEX'
}

export enum MigrationType {
    INDEX = 'INDEX',
    MAPPING = 'MAPPING',
    SETTING = 'SETTING',
    TEMPLATE = 'TEMPLATE'
}

export type MigrationScript = {
    type: Migrationtype;
    index_name: string;
    description: string;
    migrate_script: any;
};
export type MigrationExecutor = {
    execute(): void;
};

export type ResolvedMigration = {
    getVersion(): string;
    getDescription(): string;
    getScript(): string;
    getChecksum(): number;
    getType(): MigrationType;
    getPhysicalLocation(): string;
    getExecutor(): MigrationExecutor;
};

export type AppliedMigration = {
    installedRank: number;
    version: string;
    description: string;
    type: MigrationType;
    script: string;
    installedOn: Date;
    installedBy: string;
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
    resolvedMigration: ResolvedMigration;
    appliedMigration: AppliedMigration;
    context: MigrationInfoContext;
};
