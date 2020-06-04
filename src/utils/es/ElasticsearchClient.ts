import type { SimpleJson } from '../../model/types';

export default interface ElasticsearchClient {
    healthCheck(): Promise<{ status: string }>;

    putMapping: (index: string, body: any) => Promise<any>;

    createIndex: (index: string, body?: any) => Promise<any>;

    search: <R>(index: string, query?: any) => Promise<R[]>;

    exists: (index: string) => Promise<boolean>;

    version: () => string;

    putSetting: (index: string, body: any) => Promise<any>;

    delete: (index: string | string[]) => Promise<any>;

    postDocument: (index: string, body?: any, id?: string) => Promise<any>;

    close: () => void;

    getMapping: (index: string) => Promise<SimpleJson>;

    get: (index: string) => Promise<SimpleJson>;
}
