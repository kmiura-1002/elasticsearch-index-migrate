import type { ClientOptions as Es8ClientOptions } from 'es8';
import { Client as Es8Client } from 'es8';
import type { ClientOptions as Es7ClientOptions } from 'es7';
import { Client as Es7Client } from 'es7';
import type { ClientOptions as Es6ClientOptions } from 'es6';
import { Client as Es6Client } from 'es6';
import { esConnectConf, usedEsVersion } from './EsUtils';
import type { ESConfig, SearchEngineVersion, SimpleJson } from '../../types';
import {
    AcknowledgedResponse,
    Document,
    EsConnection,
    HealthStatus,
    MappingResponse,
    WriteResponse
} from './types';
import type {
    ClusterHealth as ClusterHealth6,
    Count as Count6,
    Delete as Delete6,
    DeleteByQuery as DeleteByQuery6,
    Index as Index6,
    IndicesCreate as IndicesCreate6,
    IndicesDelete as IndicesDelete6,
    IndicesExists as IndicesExists6,
    IndicesGet as IndicesGet6,
    IndicesGetMapping as IndicesGetMapping6,
    IndicesPutMapping as IndicesPutMapping6,
    IndicesPutSettings as IndicesPutSettings6,
    Search as Search6
} from 'es6/api/requestParams';
import type {
    ClusterHealth as ClusterHealth7,
    Count as Count7,
    Delete as Delete7,
    DeleteByQuery as DeleteByQuery7,
    Index as Index7,
    IndicesCreate as IndicesCreate7,
    IndicesDelete as IndicesDelete7,
    IndicesExists as IndicesExists7,
    IndicesGet as IndicesGet7,
    IndicesGetMapping as IndicesGetMapping7,
    IndicesPutMapping as IndicesPutMapping7,
    IndicesPutSettings as IndicesPutSettings7,
    Search as Search7
} from 'es7/api/requestParams';
import type {
    ClusterHealthRequest,
    CountRequest,
    DeleteByQueryRequest,
    DeleteByQueryResponse,
    DeleteRequest,
    IndexRequest,
    IndicesCreateRequest,
    IndicesDeleteRequest,
    IndicesExistsRequest,
    IndicesGetMappingRequest,
    IndicesPutMappingRequest,
    IndicesPutSettingsRequest,
    SearchRequest
} from 'es8/lib/api/types';
import { UnsupportedVersionError } from '../../context/error/UnsupportedVersionError';
import {
    closeConnection,
    countApi,
    createIndexApi,
    deleteApi,
    deleteDocumentApi,
    deleteDocumentsApi,
    existsApi,
    getIndexApi,
    getMappingApi,
    healthCheckApi,
    postDocumentApi,
    putMappingApi,
    putSettingApi,
    searchApi
} from './api';

function esClientBind(esConfig: ESConfig): EsConnection {
    const connectConf = esConnectConf(esConfig.connect);
    const version = usedEsVersion({
        version: esConfig.version,
        searchEngine: esConfig.searchEngine
    });
    const majorVersion = version.major;

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
            case 8:
                return {
                    client: new Es8Client(connectConf as Es8ClientOptions),
                    version
                };
            default:
                throw new UnsupportedVersionError(
                    `${esConfig.version} is unsupported. support version is 6.x or 7.x.`
                );
        }
    } else {
        throw new UnsupportedVersionError(
            `Unknown version:${esConfig.version}. support version is 6.x or 7.x.`
        );
    }
}

export function useElasticsearchClient(connectConf: ESConfig) {
    const connection = esClientBind(connectConf);

    const healthCheck = (
        request?: ClusterHealth6 | ClusterHealth7 | ClusterHealthRequest
    ): Promise<HealthStatus> => healthCheckApi(connection, request);

    const putMapping = (
        request: IndicesPutMapping6 | IndicesPutMapping7 | IndicesPutMappingRequest
    ): Promise<AcknowledgedResponse> => putMappingApi(connection, request);

    const createIndex = (
        request: IndicesCreate6 | IndicesCreate7 | IndicesCreateRequest
    ): Promise<AcknowledgedResponse> => createIndexApi(connection, request);

    const search = <R>(param: Search6 | Search7 | SearchRequest): Promise<Document<R>[]> =>
        searchApi(connection, param);

    const exists = (
        param: IndicesExists6 | IndicesExists7 | IndicesExistsRequest
    ): Promise<boolean> => existsApi(connection, param);

    const version = (): SearchEngineVersion => {
        if (connection.version) return connection.version;
        else throw new UnsupportedVersionError('illegal version error');
    };

    const putSetting = (
        param: IndicesPutSettings6 | IndicesPutSettings7 | IndicesPutSettingsRequest
    ): Promise<AcknowledgedResponse> => putSettingApi(connection, param);

    const deleteIndex = (
        param: IndicesDelete6 | IndicesDelete7 | IndicesDeleteRequest
    ): Promise<AcknowledgedResponse> => deleteApi(connection, param);

    const postDocument = (param: Index6 | Index7 | IndexRequest): Promise<WriteResponse> =>
        postDocumentApi(connection, param);

    const close = (): Promise<void> => closeConnection(connection);

    const getMapping = (
        param: IndicesGetMapping6 | IndicesGetMapping7 | IndicesGetMappingRequest
    ): Promise<MappingResponse> => getMappingApi(connection, param);

    const getIndex = (param: IndicesGet6 | IndicesGet7): Promise<SimpleJson> =>
        getIndexApi(connection, param);

    const deleteDocuments = (
        param: DeleteByQuery6 | DeleteByQuery7 | DeleteByQueryRequest
    ): Promise<DeleteByQueryResponse> => deleteDocumentsApi(connection, param);

    const deleteDocument = (param: Delete6 | Delete7 | DeleteRequest): Promise<WriteResponse> =>
        deleteDocumentApi(connection, param);

    const count = (param: Count6 | Count7 | CountRequest): Promise<number> =>
        countApi(connection, param);

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
        deleteDocuments,
        deleteDocument,
        count
    };
}
