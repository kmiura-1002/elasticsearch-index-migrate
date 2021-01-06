import type { SimpleJson } from '../../model/types';
import {
    ClusterHealth as ClusterHealth6,
    IndicesCreate as IndicesCreate6,
    IndicesExists as IndicesExists6,
    IndicesPutMapping as IndicesPutMapping6
} from 'es6/api/requestParams';
import {
    ClusterHealth as ClusterHealth7,
    IndicesCreate as IndicesCreate7,
    IndicesExists as IndicesExists7,
    IndicesPutMapping as IndicesPutMapping7
} from 'es7/api/requestParams';

export default interface ElasticsearchClient {
    healthCheck(param?: ClusterHealth6 | ClusterHealth7): Promise<{ status: string }>;

    putMapping: (param: IndicesPutMapping6 | IndicesPutMapping7) => Promise<any>;

    createIndex: (param: IndicesCreate6 | IndicesCreate7) => Promise<any>;

    search: <R>(index: string, query?: any) => Promise<R[]>;

    exists: (param: IndicesExists6 | IndicesExists7) => Promise<boolean>;

    version: () => string;

    putSetting: (index: string, body: any) => Promise<any>;

    delete: (index: string | string[]) => Promise<any>;

    postDocument: (index: string, body?: any, id?: string) => Promise<any>;

    close: () => void;

    getMapping: (index: string) => Promise<SimpleJson>;

    get: (index: string) => Promise<SimpleJson>;

    deleteDocument: (indexName: string, body?: any) => Promise<any>;
}
