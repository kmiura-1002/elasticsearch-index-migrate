import { esConnectConf } from '../EsUtils';
import { injectable, inject } from 'inversify';
import { Bindings } from '../../../ioc.bindings';
import ElasticsearchClient, { convertGetMappingResponse, isIndex7 } from '../ElasticsearchClient';
import { ESConnectConfig, IndexSearchResults7, SimpleJson } from '../../../model/types';

import { ApiResponse, Client, ClientOptions } from '@opensearch-project/opensearch';
import {
    ClusterHealth,
    DeleteByQuery,
    Index,
    IndicesCreate,
    IndicesDelete,
    IndicesExists,
    IndicesGet,
    IndicesGetMapping,
    IndicesPutMapping,
    IndicesPutSettings,
    Search
} from '@opensearch-project/opensearch/api/requestParams';
import { Index as Index6 } from 'es6/api/requestParams';

@injectable()
class OpenSearchClient implements ElasticsearchClient {
    client: Client;

    public constructor(@inject(Bindings.ESConfig) connectConf: ESConnectConfig) {
        this.client = new Client(esConnectConf(connectConf) as ClientOptions);
    }

    createIndex(param: IndicesCreate): Promise<ApiResponse<any, any>> {
        return this.client.indices.create(param);
    }

    exists(param: IndicesExists): Promise<boolean> {
        return this.client.indices.exists(param).then((value) => value.body as boolean);
    }

    async healthCheck(param?: ClusterHealth): Promise<{ status: string }> {
        const healthCheck: ApiResponse = await this.client.cluster.health({ ...param });
        return { status: healthCheck.body.status };
    }

    putMapping(param: IndicesPutMapping): Promise<ApiResponse<any, any>> {
        return this.client.indices.putMapping(param);
    }

    search<R>(param: Search): Promise<R[]> {
        return this.client
            .search(param)
            .then((value: ApiResponse<Record<string, IndexSearchResults7<R>>>) =>
                value.body.hits.hits.map((hit) => hit._source as R)
            );
    }

    putSetting(param: IndicesPutSettings): Promise<ApiResponse<any, any>> {
        return this.client.indices.putSettings(param);
    }

    version(): string {
        return 'opensearch';
    }

    close(): Promise<void> {
        return this.client.close();
    }

    postDocument(param: Index6 | Index): Promise<ApiResponse<any, any>> {
        if (isIndex7(param)) {
            return this.client.index({
                ...param,
                type: param.type ? param.type : '_doc'
            });
        }
        return Promise.reject(`illegal argument : ${JSON.stringify(param)}`);
    }

    delete(param: IndicesDelete): Promise<ApiResponse<any, any>> {
        return this.client.indices.delete(param);
    }

    getMapping(param: IndicesGetMapping): Promise<Array<SimpleJson>> {
        return this.client.indices
            .getMapping(param)
            .then((value) => convertGetMappingResponse(param, value));
    }

    get(param: IndicesGet): Promise<SimpleJson> {
        return this.client.indices.get(param).then((value) => value.body as SimpleJson);
    }

    deleteDocument(param: DeleteByQuery): Promise<ApiResponse<any, any>> {
        return this.client.deleteByQuery(param);
    }
}

export default OpenSearchClient;
