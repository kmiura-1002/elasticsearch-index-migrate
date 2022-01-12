import { esConnectConf } from '../EsUtils';
import { Client } from 'es6';
import { ApiResponse as ApiResponse6, ApiResponse } from 'es6/lib/Transport';
import { inject, injectable } from 'inversify';
import OldElasticsearchClient, {
    convertGetMappingResponse,
    isDeleteByQuery6,
    isIndex6,
    isIndicesDelete6,
    isIndicesExists6,
    isIndicesGet6,
    isIndicesGetMapping6,
    isIndicesPutMapping6,
    isIndicesPutSettings6,
    isSearch6
} from '../../es/ElasticsearchClient';
import {
    ELASTICSEARCH_VERSION,
    ESConnectConfig,
    IndexSearchResults6,
    SimpleJson
} from '../../../types';
import { ClientOptions } from 'es6';
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
import { Bindings } from '../../../ioc.bindings';

@injectable()
class Elasticsearch6Client implements OldElasticsearchClient {
    client: Client;

    public constructor(@inject(Bindings.ESConfig) connectConf: ESConnectConfig) {
        this.client = new Client(esConnectConf(connectConf) as ClientOptions);
    }

    createIndex(param: IndicesCreate6): Promise<ApiResponse6<any, any>> {
        return this.client.indices.create(param);
    }

    async exists(param: IndicesExists6 | IndicesExists7): Promise<boolean> {
        if (isIndicesExists6(param)) {
            return await this.client.indices.exists(param).then((value) => value.body as boolean);
        }
        return Promise.reject(`illegal argument : ${JSON.stringify(param)}`);
    }

    async healthCheck(param?: ClusterHealth6): Promise<{ status: string }> {
        const healthCheck: ApiResponse = await this.client.cluster.health({ ...param });
        return { status: healthCheck.body.status };
    }

    putMapping(param: IndicesPutMapping6 | IndicesPutMapping7): Promise<ApiResponse6<any, any>> {
        if (isIndicesPutMapping6(param)) {
            return this.client.indices.putMapping({
                ...param,
                type: param.type ? param.type : '_doc'
            });
        }
        return Promise.reject(`illegal argument : ${JSON.stringify(param)}`);
    }

    search<R>(param: Search6 | Search7): Promise<R[]> {
        if (isSearch6(param)) {
            return this.client
                .search(param)
                .then((value: ApiResponse<IndexSearchResults6<R>>) =>
                    value.body.hits.hits.map((hit) => hit._source as R)
                );
        }
        return Promise.reject(`illegal argument : ${JSON.stringify(param)}`);
    }

    putSetting(param: IndicesPutSettings6 | IndicesPutSettings7): Promise<ApiResponse6<any, any>> {
        if (isIndicesPutSettings6(param)) {
            return this.client.indices.putSettings(param);
        }
        return Promise.reject(`illegal argument : ${JSON.stringify(param)}`);
    }

    version(): ELASTICSEARCH_VERSION {
        return '6.x';
    }

    close(): void | Promise<void> {
        return this.client.close();
    }

    postDocument(param: Index6 | Index7): Promise<ApiResponse6<any, any>> {
        if (isIndex6(param)) {
            return this.client.index({
                ...param,
                type: param.type ? param.type : '_doc'
            });
        }
        return Promise.reject(`illegal argument : ${JSON.stringify(param)}`);
    }

    delete(param: IndicesDelete6 | IndicesDelete7): Promise<ApiResponse6<any, any>> {
        if (isIndicesDelete6(param)) {
            return this.client.indices.delete(param);
        }
        return Promise.reject(`illegal argument : ${JSON.stringify(param)}`);
    }

    getMapping(param: IndicesGetMapping6 | IndicesGetMapping7): Promise<Array<SimpleJson>> {
        if (isIndicesGetMapping6(param)) {
            return this.client.indices
                .getMapping(param)
                .then((value) => convertGetMappingResponse(param, value));
        }
        return Promise.reject(`illegal argument : ${JSON.stringify(param)}`);
    }

    get(param: IndicesGet6 | IndicesGet7): Promise<SimpleJson> {
        if (isIndicesGet6(param)) {
            return this.client.indices.get(param).then((value) => value.body as SimpleJson);
        }
        return Promise.reject(`illegal argument : ${JSON.stringify(param)}`);
    }

    deleteDocument(param: DeleteByQuery6 | DeleteByQuery7): Promise<ApiResponse6<any, any>> {
        if (isDeleteByQuery6(param)) {
            return this.client.deleteByQuery(param);
        }
        return Promise.reject(`illegal argument : ${JSON.stringify(param)}`);
    }
}

export default Elasticsearch6Client;
