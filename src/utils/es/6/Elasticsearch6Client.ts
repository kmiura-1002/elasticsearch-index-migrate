import { esConnectConf } from '../EsUtils';
import { Client } from 'es6';
import { ApiResponse } from 'es6/lib/Transport';
import { inject, injectable } from 'inversify';
import { Bindings } from '../../../ioc.bindings';
import ElasticsearchClient, {
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
} from '../ElasticsearchClient';
import { ESConnectConfig, IndexSearchResults6, SimpleJson } from '../../../model/types';
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

@injectable()
class Elasticsearch6Client implements ElasticsearchClient {
    client: Client;

    constructor(
        @inject(Bindings.ESConfig)
        private readonly connectConf: ESConnectConfig
    ) {
        this.client = new Client(esConnectConf(connectConf) as ClientOptions);
    }

    async createIndex(param: IndicesCreate6) {
        return await this.client.indices.create(param);
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

    async putMapping(param: IndicesPutMapping6 | IndicesPutMapping7) {
        if (isIndicesPutMapping6(param)) {
            return await this.client.indices.putMapping({
                ...param,
                type: param.type ? param.type : '_doc'
            });
        }
        return Promise.reject(`illegal argument : ${JSON.stringify(param)}`);
    }

    async search<R>(param: Search6 | Search7) {
        if (isSearch6(param)) {
            return await this.client
                .search(param)
                .then((value: ApiResponse<IndexSearchResults6<R>>) =>
                    value.body.hits.hits.map((hit) => hit._source as R)
                );
        }
        return Promise.reject(`illegal argument : ${JSON.stringify(param)}`);
    }

    async putSetting(param: IndicesPutSettings6 | IndicesPutSettings7): Promise<any> {
        if (isIndicesPutSettings6(param)) {
            return await this.client.indices.putSettings(param);
        }
        return Promise.reject(`illegal argument : ${JSON.stringify(param)}`);
    }

    version(): string {
        return '6.x';
    }

    async close() {
        await this.client.close();
    }

    async postDocument(param: Index6 | Index7) {
        if (isIndex6(param)) {
            return await this.client.index({
                ...param,
                type: param.type ? param.type : '_doc'
            });
        }
        return Promise.reject(`illegal argument : ${JSON.stringify(param)}`);
    }

    async delete(param: IndicesDelete6 | IndicesDelete7) {
        if (isIndicesDelete6(param)) {
            return await this.client.indices.delete(param);
        }
        return Promise.reject(`illegal argument : ${JSON.stringify(param)}`);
    }

    async getMapping(param: IndicesGetMapping6 | IndicesGetMapping7): Promise<Array<SimpleJson>> {
        if (isIndicesGetMapping6(param)) {
            return await this.client.indices
                .getMapping(param)
                .then((value) => convertGetMappingResponse(param, value));
        }
        return Promise.reject(`illegal argument : ${JSON.stringify(param)}`);
    }

    async get(param: IndicesGet6 | IndicesGet7): Promise<SimpleJson> {
        if (isIndicesGet6(param)) {
            return await this.client.indices.get(param).then((value) => value.body as SimpleJson);
        }
        return Promise.reject(`illegal argument : ${JSON.stringify(param)}`);
    }

    async deleteDocument(param: DeleteByQuery6 | DeleteByQuery7): Promise<any> {
        if (isDeleteByQuery6(param)) {
            return await this.client.deleteByQuery(param);
        }
        return Promise.reject(`illegal argument : ${JSON.stringify(param)}`);
    }
}

export default Elasticsearch6Client;
