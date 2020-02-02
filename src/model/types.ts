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
