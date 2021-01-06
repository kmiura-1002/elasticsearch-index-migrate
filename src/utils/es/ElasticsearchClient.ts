import type { SimpleJson } from '../../model/types';
import {
    ClusterHealth as ClusterHealth6,
    IndicesCreate as IndicesCreate6,
    IndicesExists as IndicesExists6,
    IndicesPutMapping as IndicesPutMapping6,
    Search as Search6
} from 'es6/api/requestParams';
import {
    ClusterHealth as ClusterHealth7,
    IndicesCreate as IndicesCreate7,
    IndicesExists as IndicesExists7,
    IndicesPutMapping as IndicesPutMapping7,
    Search as Search7
} from 'es7/api/requestParams';

export default interface ElasticsearchClient {
    healthCheck(param?: ClusterHealth6 | ClusterHealth7): Promise<{ status: string }>;

    putMapping: (param: IndicesPutMapping6 | IndicesPutMapping7) => Promise<any>;

    createIndex: (param: IndicesCreate6 | IndicesCreate7) => Promise<any>;

    search: <R>(param: Search6 | Search7) => Promise<R[]>;

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

function expandWildcardsCheck(param: string) {
    switch (param) {
        case 'all':
        case 'closed':
        case 'none':
        case 'open':
            return true;
        default:
            return false;
    }
}

export function isIndicesExists6(param: IndicesExists6 | IndicesExists7): param is IndicesExists6 {
    if (!param?.expand_wildcards) {
        return false;
    }
    return expandWildcardsCheck(param.expand_wildcards);
}

export function isIndicesPutMapping6(
    param: IndicesPutMapping6 | IndicesPutMapping7
): param is IndicesPutMapping6 {
    if (!param?.expand_wildcards) {
        return false;
    }
    return expandWildcardsCheck(param.expand_wildcards);
}

export function isSearch6(param: Search6 | Search7): param is Search6 {
    if (!param?.expand_wildcards) {
        return false;
    }
    if (Object.keys(param).includes('ccs_minimize_roundtrips')) {
        return false;
    }
    return expandWildcardsCheck(param.expand_wildcards);
}
