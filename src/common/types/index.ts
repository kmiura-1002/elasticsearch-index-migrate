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

export type MigrationConfig = {
    elasticsearch: ESConfig;
    migration: {
        locations: string[];
        baselineVersion: string;
    };
};
