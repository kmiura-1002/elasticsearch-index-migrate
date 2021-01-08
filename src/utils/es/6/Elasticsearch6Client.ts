import { esConnectConf } from '../EsUtils';
import { Client } from 'es6';
import { ApiResponse } from 'es6/lib/Transport';
import { inject, injectable } from 'inversify';
import { Bindings } from '../../../ioc.bindings';
import ElasticsearchClient, {
    isIndex6,
    isIndicesExists6,
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
    Search as Search6,
    Index as Index6
} from 'es6/api/requestParams';
import {
    IndicesExists as IndicesExists7,
    IndicesPutMapping as IndicesPutMapping7,
    IndicesPutSettings as IndicesPutSettings7,
    Search as Search7,
    Index as Index7
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
                ...param
            });
        }
        return Promise.reject(`illegal argument : ${JSON.stringify(param)}`);
    }

    async delete(index: string | string[]) {
        return await this.client.indices.delete({ index });
    }

    async getMapping(index: string): Promise<SimpleJson> {
        return await this.client.indices.getMapping({ index }).then((value) => value.body[index]);
    }

    async get(index: string): Promise<SimpleJson> {
        return await this.client.indices.get({ index }).then((value) => value.body as SimpleJson);
    }

    async deleteDocument(indexName: string, body: any): Promise<any> {
        return await this.client.deleteByQuery({ index: indexName, body });
    }
}

export default Elasticsearch6Client;
