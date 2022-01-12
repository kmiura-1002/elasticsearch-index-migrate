import type { SimpleJson, ESConfig, SearchEngineVersion } from '../../types';
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
    DeleteByQuery as DeleteByQuery6,
    Generic as Generic6
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
    DeleteByQuery as DeleteByQuery7,
    Generic as Generic7
} from 'es7/api/requestParams';
import { ApiResponse as ApiResponse6 } from 'es6/lib/Transport';
import { ApiResponse as ApiResponse7 } from 'es7/lib/Transport';
import { Client as Es7Client, ClientOptions as Es7ClientOptions } from 'es7';
import { Client as Es6Client, ClientOptions as Es6ClientOptions } from 'es6';
import { esConnectConf, usedEsVersion } from './EsUtils';

type EsConnection = {
    client: Es6Client | Es7Client;
    version: SearchEngineVersion | undefined;
};

function esClientBind(esConfig: ESConfig): EsConnection {
    const connectConf = esConnectConf(esConfig.connect);
    const version = usedEsVersion(esConfig.version);
    const majorVersion = version?.major;

    if (majorVersion) {
        switch (majorVersion) {
            case 6:
                return {
                    client: new Es6Client(connectConf as Es6ClientOptions),
                    version
                };
            case 7:
                return {
                    client: new Es7Client(connectConf as Es7ClientOptions),
                    version
                };
            default:
                throw new Error(
                    `${esConfig.version} is unsupported. support version is 6.x or 7.x.`
                );
        }
    } else {
        throw new Error(`Unknown version:${esConfig.version}. support version is 6.x or 7.x.`);
    }
}

function convertGetMappingResponse(
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

function isE6Client<ES6Request extends Generic6, ES7Request extends Generic7>(
    param: { client: Es6Client | Es7Client; request?: ES6Request | ES7Request },
    version: SearchEngineVersion | undefined
): param is { client: Es6Client; request: ES6Request } {
    return version?.major === 6;
}

function isE7Client<ES6Request extends Generic6, ES7Request extends Generic7>(
    param: { client: Es6Client | Es7Client; request?: ES6Request | ES7Request },
    version: SearchEngineVersion | undefined
): param is { client: Es7Client; request: ES7Request } {
    return version?.major === 7;
}

const healthCheckApi = (connection: EsConnection, request?: ClusterHealth6 | ClusterHealth7) => {
    const param = { client: connection.client, request: request ?? {} };

    if (isE6Client<ClusterHealth6, ClusterHealth7>(param, connection.version)) {
        return param.client.cluster.health({ ...param.request });
    } else if (isE7Client<ClusterHealth6, ClusterHealth7>(param, connection.version)) {
        return param.client.cluster.health({ ...param.request });
    }
    return Promise.reject(`illegal argument : ${JSON.stringify(param)}`);
};

const putMappingApi = (
    connection: EsConnection,
    request: IndicesPutMapping6 | IndicesPutMapping7
) => {
    const param = { client: connection.client, request };

    if (isE6Client<IndicesPutMapping6, IndicesPutMapping7>(param, connection.version)) {
        return param.client.indices.putMapping({
            ...param.request,
            type: param.request.type ? param.request.type : '_doc'
        });
    } else if (isE7Client<IndicesPutMapping6, IndicesPutMapping7>(param, connection.version)) {
        return param.client.indices.putMapping(param.request);
    }
    return Promise.reject(`illegal argument : ${JSON.stringify(param)}`);
};

const createIndexApi = (connection: EsConnection, request: IndicesCreate6 | IndicesCreate7) => {
    const param = { client: connection.client, request };

    if (isE6Client<IndicesCreate6, IndicesCreate7>(param, connection.version)) {
        return param.client.indices.create(param.request);
    } else if (isE7Client<IndicesCreate6, IndicesCreate7>(param, connection.version)) {
        return param.client.indices.create(param.request);
    }
    return Promise.reject(`illegal argument : ${JSON.stringify(param)}`);
};

const searchApi = (connection: EsConnection, request: Search6 | Search7) => {
    const param = { client: connection.client, request };

    if (isE6Client<Search6, Search7>(param, connection.version)) {
        return param.client.search(param.request);
    } else if (isE7Client<Search6, Search7>(param, connection.version)) {
        return param.client.search(param.request);
    }
    return Promise.reject(`illegal argument : ${JSON.stringify(param)}`);
};

const putSettingApi = (
    connection: EsConnection,
    request: IndicesPutSettings6 | IndicesPutSettings7
) => {
    const param = { client: connection.client, request };

    if (isE6Client<IndicesPutSettings6, IndicesPutSettings7>(param, connection.version)) {
        return param.client.indices.putSettings(param.request);
    } else if (isE7Client<IndicesPutSettings6, IndicesPutSettings7>(param, connection.version)) {
        return param.client.indices.putSettings(param.request);
    }
    return Promise.reject(`illegal argument : ${JSON.stringify(param)}`);
};

const existsApi = (connection: EsConnection, request: IndicesExists6 | IndicesExists7) => {
    const param = { client: connection.client, request };

    if (isE6Client<IndicesExists6, IndicesExists7>(param, connection.version)) {
        return param.client.indices.exists(param.request);
    } else if (isE7Client<IndicesExists6, IndicesExists7>(param, connection.version)) {
        return param.client.indices.exists(param.request);
    }
    return Promise.reject(`illegal argument : ${JSON.stringify(param)}`);
};

const deleteApi = (connection: EsConnection, request: IndicesDelete6 | IndicesDelete7) => {
    const param = { client: connection.client, request };

    if (isE6Client<IndicesDelete6, IndicesDelete7>(param, connection.version)) {
        return param.client.indices.delete(param.request);
    } else if (isE7Client<IndicesDelete6, IndicesDelete7>(param, connection.version)) {
        return param.client.indices.delete(param.request);
    }
    return Promise.reject(`illegal argument : ${JSON.stringify(param)}`);
};

const postDocumentApi = (connection: EsConnection, request: Index6 | Index7) => {
    const param = { client: connection.client, request };

    if (isE6Client<Index6, Index7>(param, connection.version)) {
        return param.client.index(param.request);
    } else if (isE7Client<Index6, Index7>(param, connection.version)) {
        return param.client.index(param.request);
    }
    return Promise.reject(`illegal argument : ${JSON.stringify(param)}`);
};

const closeConnection = async (connection: EsConnection) => {
    const param = { client: connection.client };

    if (isE6Client(param, connection.version)) {
        return param.client.close();
    } else if (isE7Client<Index6, Index7>(param, connection.version)) {
        return param.client.close();
    }
    return Promise.reject(`illegal argument : ${JSON.stringify(param)}`);
};

const getMappingApi = (
    connection: EsConnection,
    request: IndicesGetMapping6 | IndicesGetMapping7
) => {
    const param = { client: connection.client, request };

    if (isE6Client<IndicesGetMapping6, IndicesGetMapping7>(param, connection.version)) {
        return param.client.indices.getMapping(param.request);
    } else if (isE7Client<IndicesGetMapping6, IndicesGetMapping7>(param, connection.version)) {
        return param.client.indices.getMapping(param.request);
    }
    return Promise.reject(`illegal argument : ${JSON.stringify(param)}`);
};

const getIndexApi = (connection: EsConnection, request: IndicesGet6 | IndicesGet7) => {
    const param = { client: connection.client, request };

    if (isE6Client<IndicesGetMapping6, IndicesGetMapping7>(param, connection.version)) {
        return param.client.indices.get(param.request);
    } else if (isE7Client<IndicesGetMapping6, IndicesGetMapping7>(param, connection.version)) {
        return param.client.indices.get(param.request);
    }
    return Promise.reject(`illegal argument : ${JSON.stringify(param)}`);
};

const deleteDocumentApi = (connection: EsConnection, request: DeleteByQuery6 | DeleteByQuery7) => {
    const param = { client: connection.client, request };

    if (isE6Client<DeleteByQuery6, DeleteByQuery7>(param, connection.version)) {
        return param.client.deleteByQuery(param.request);
    } else if (isE7Client<DeleteByQuery6, DeleteByQuery7>(param, connection.version)) {
        return param.client.deleteByQuery(param.request);
    }
    return Promise.reject(`illegal argument : ${JSON.stringify(param)}`);
};

export default function useElasticsearchClient(connectConf: ESConfig) {
    const connection = esClientBind(connectConf);

    const healthCheck = (request?: ClusterHealth6 | ClusterHealth7): Promise<{ status: string }> =>
        healthCheckApi(connection, request).then((value) => ({ status: value.body.status }));

    const putMapping = (
        request: IndicesPutMapping6 | IndicesPutMapping7
    ): Promise<ApiResponse6<any, any> | ApiResponse7<any, any>> =>
        putMappingApi(connection, request);

    const createIndex = (
        request: IndicesCreate6 | IndicesCreate7
    ): Promise<ApiResponse6<any, any> | ApiResponse7<any, any>> =>
        createIndexApi(connection, request);

    const search = <R>(param: Search6 | Search7): Promise<R[]> =>
        searchApi(connection, param).then((value) =>
            value.body.hits.hits.map(
                (hit: {
                    _index: string;
                    _type: string;
                    _id: string;
                    _score?: number;
                    _source: R;
                }) => hit._source
            )
        );

    const exists = (param: IndicesExists6 | IndicesExists7): Promise<boolean> =>
        existsApi(connection, param).then((value) => value.body);

    const version = (): SearchEngineVersion => {
        if (connection.version) return connection.version;
        else throw new Error('illegal version error');
    };

    const putSetting = (
        param: IndicesPutSettings6 | IndicesPutSettings7
    ): Promise<ApiResponse6<any, any> | ApiResponse7<any, any>> => putSettingApi(connection, param);

    const deleteIndex = (
        param: IndicesDelete6 | IndicesDelete7
    ): Promise<ApiResponse6<any, any> | ApiResponse7<any, any>> => deleteApi(connection, param);

    const postDocument = (
        param: Index6 | Index7
    ): Promise<ApiResponse6<any, any> | ApiResponse7<any, any>> =>
        postDocumentApi(connection, param);
    const close = (): Promise<void> => closeConnection(connection);

    const getMapping = (
        param: IndicesGetMapping6 | IndicesGetMapping7
    ): Promise<Array<SimpleJson>> =>
        getMappingApi(connection, param).then((value) => convertGetMappingResponse(param, value));

    const getIndex = (param: IndicesGet6 | IndicesGet7): Promise<SimpleJson> =>
        getIndexApi(connection, param).then((param) => param.body);

    const deleteDocument = (
        param: DeleteByQuery6 | DeleteByQuery7
    ): Promise<ApiResponse6<any, any> | ApiResponse7<any, any>> =>
        deleteDocumentApi(connection, param);

    return {
        healthCheck,
        putMapping,
        createIndex,
        search,
        exists,
        version,
        putSetting,
        deleteIndex,
        postDocument,
        close,
        getMapping,
        getIndex,
        deleteDocument
    };
}
