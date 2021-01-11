import type { SimpleJson } from '../../model/types';
import {
    ClusterHealth as ClusterHealth6,
    IndicesCreate as IndicesCreate6,
    IndicesExists as IndicesExists6,
    IndicesPutMapping as IndicesPutMapping6,
    IndicesPutSettings as IndicesPutSettings6,
    IndicesDelete as IndicesDelete6,
    IndicesGetMapping as IndicesGetMapping6,
    IndicesGet as IndicesGet6,
    Search as Search6,
    Index as Index6,
    DeleteByQuery as DeleteByQuery6
} from 'es6/api/requestParams';
import {
    ClusterHealth as ClusterHealth7,
    IndicesCreate as IndicesCreate7,
    IndicesExists as IndicesExists7,
    IndicesPutMapping as IndicesPutMapping7,
    IndicesPutSettings as IndicesPutSettings7,
    IndicesDelete as IndicesDelete7,
    IndicesGetMapping as IndicesGetMapping7,
    IndicesGet as IndicesGet7,
    Search as Search7,
    Index as Index7,
    DeleteByQuery as DeleteByQuery7
} from 'es7/api/requestParams';
import { ApiResponse as ApiResponse6 } from 'es6/lib/Transport';
import { ApiResponse as ApiResponse7 } from 'es7/lib/Transport';

export default interface ElasticsearchClient {
    healthCheck(param?: ClusterHealth6 | ClusterHealth7): Promise<{ status: string }>;

    putMapping: (param: IndicesPutMapping6 | IndicesPutMapping7) => Promise<any>;

    createIndex: (param: IndicesCreate6 | IndicesCreate7) => Promise<any>;

    search: <R>(param: Search6 | Search7) => Promise<R[]>;

    exists: (param: IndicesExists6 | IndicesExists7) => Promise<boolean>;

    version: () => string;

    putSetting: (param: IndicesPutSettings6 | IndicesPutSettings7) => Promise<any>;

    delete: (param: IndicesDelete6 | IndicesDelete7) => Promise<any>;

    postDocument: (param: Index6 | Index7) => Promise<any>;

    close: () => void;

    getMapping: (param: IndicesGetMapping6 | IndicesGetMapping7) => Promise<Array<SimpleJson>>;

    get: (param: IndicesGet6 | IndicesGet7) => Promise<SimpleJson>;

    deleteDocument: (param: DeleteByQuery6 | DeleteByQuery7) => Promise<any>;
}

function expandWildcardsCheck(param?: string) {
    if (!param) {
        return true;
    }
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

function versionTypeCheck(param?: string) {
    if (!param) {
        return true;
    }
    switch (param) {
        case 'force':
            return false;
        default:
            return true;
    }
}

export function isIndicesExists6(param: IndicesExists6 | IndicesExists7): param is IndicesExists6 {
    return expandWildcardsCheck(param.expand_wildcards);
}

export function isIndicesPutMapping6(
    param: IndicesPutMapping6 | IndicesPutMapping7
): param is IndicesPutMapping6 {
    return expandWildcardsCheck(param.expand_wildcards);
}

export function isIndicesPutSettings6(
    param: IndicesPutSettings6 | IndicesPutSettings7
): param is IndicesPutSettings6 {
    return expandWildcardsCheck(param.expand_wildcards);
}

export function isSearch6(param: Search6 | Search7): param is Search6 {
    if (Object.keys(param).includes('ccs_minimize_roundtrips')) {
        return false;
    }
    if (!param.expand_wildcards) {
        return true;
    }
    return expandWildcardsCheck(param.expand_wildcards);
}

export function isIndex6(param: Index6 | Index7): param is Index6 {
    if (Object.keys(param).includes('parent')) {
        return true;
    }
    // if (param.type === undefined) {
    //     return false;
    // }
    return !(param.refresh && typeof param.refresh === 'boolean');
}

export function isIndex7(param: Index6 | Index7): param is Index7 {
    if (Object.keys(param).includes('parent')) {
        return false;
    }
    if (param.refresh && typeof param.refresh === 'boolean') {
        return true;
    }
    return versionTypeCheck(param.version_type);
}

export function isIndicesDelete6(param: IndicesDelete6 | IndicesDelete7): param is IndicesDelete6 {
    return expandWildcardsCheck(param.expand_wildcards);
}

export function isIndicesGetMapping6(
    param: IndicesGetMapping6 | IndicesGetMapping7
): param is IndicesGetMapping6 {
    return expandWildcardsCheck(param.expand_wildcards);
}

export function isIndicesGet6(param: IndicesGet6 | IndicesGet7): param is IndicesGet6 {
    return expandWildcardsCheck(param.expand_wildcards);
}

export function isDeleteByQuery6(param: DeleteByQuery6 | DeleteByQuery7): param is DeleteByQuery6 {
    if (Object.keys(param).includes('max_docs')) {
        return false;
    }
    return expandWildcardsCheck(param.expand_wildcards);
}

export function convertGetMappingResponse(
    param: IndicesGetMapping6 | IndicesGetMapping7,
    res: ApiResponse6 | ApiResponse7
): Array<SimpleJson> {
    if (param.index === undefined) {
        return [res.body] as SimpleJson[];
    }
    if (Array.isArray(param.index)) {
        return param.index.flatMap((value) => res.body[value] as SimpleJson);
    }
    return [res.body[param.index]] as SimpleJson[];
}
