import { esConnectConf } from '../EsUtils';
import { Client } from 'es7';
import { ApiResponse as ApiResponse7, ApiResponse } from 'es7/lib/Transport';
import { injectable, inject } from 'inversify';
import { Bindings } from '../../../ioc.bindings';
import OldElasticsearchClient, { convertGetMappingResponse, isIndex7 } from '../ElasticsearchClient';
import {
    ELASTICSEARCH_VERSION,
    ESConnectConfig,
    IndexSearchResults7,
    SimpleJson
} from '../../../types';
import { ClientOptions } from 'es7';
import { Index as Index6 } from 'es6/api/requestParams';
import {
    ClusterHealth,
    IndicesCreate,
    IndicesExists,
    IndicesPutMapping,
    IndicesPutSettings,
    IndicesDelete,
    Search,
    Index as Index7,
    IndicesGetMapping,
    IndicesGet,
    DeleteByQuery
} from 'es7/api/requestParams';

@injectable()
class Elasticsearch7Client implements OldElasticsearchClient {
    client: Client;

    public constructor(@inject(Bindings.ESConfig) connectConf: ESConnectConfig) {
        this.client = new Client(esConnectConf(connectConf) as ClientOptions);
    }

    createIndex(param: IndicesCreate): Promise<ApiResponse7<any, any>> {
        return this.client.indices.create(param);
    }

    exists(param: IndicesExists): Promise<boolean> {
        return this.client.indices.exists(param).then((value) => value.body as boolean);
    }

    async healthCheck(param?: ClusterHealth): Promise<{ status: string }> {
        const healthCheck: ApiResponse = await this.client.cluster.health({ ...param });
        return { status: healthCheck.body.status };
    }

    putMapping(param: IndicesPutMapping): Promise<ApiResponse7<any, any>> {
        return this.client.indices.putMapping(param);
    }

    search<R>(param: Search): Promise<R[]> {
        return this.client
            .search(param)
            .then((value: ApiResponse<Record<string, IndexSearchResults7<R>>>) =>
                value.body.hits.hits.map((hit) => hit._source as R)
            );
    }

    putSetting(param: IndicesPutSettings): Promise<ApiResponse7<any, any>> {
        return this.client.indices.putSettings(param);
    }

    version(): ELASTICSEARCH_VERSION {
        return '7.x';
    }

    close(): Promise<void> {
        return this.client.close();
    }

    postDocument(param: Index6 | Index7): Promise<ApiResponse7<any, any>> {
        if (isIndex7(param)) {
            return this.client.index({
                ...param,
                type: param.type ? param.type : '_doc'
            });
        }
        return Promise.reject(`illegal argument : ${JSON.stringify(param)}`);
    }

    delete(param: IndicesDelete): Promise<ApiResponse7<any, any>> {
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

    deleteDocument(param: DeleteByQuery): Promise<ApiResponse7<any, any>> {
        return this.client.deleteByQuery(param);
    }
}

export default Elasticsearch7Client;
