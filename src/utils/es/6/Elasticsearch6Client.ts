import { esConnectConf } from '../EsUtils';
import { Client } from 'es6';
import { ApiResponse } from 'es6/lib/Transport';
import { inject, injectable } from 'inversify';
import { Bindings } from '../../../ioc.bindings';
import ElasticsearchClient, {
    isIndicesExists6,
    isIndicesPutMapping6
} from '../ElasticsearchClient';
import { ESConnectConfig, IndexSearchResults6, SimpleJson } from '../../../model/types';
import { ClientOptions } from 'es6';
import {
    ClusterHealth as ClusterHealth6,
    IndicesCreate as IndicesCreate6,
    IndicesExists as IndicesExists6,
    IndicesPutMapping as IndicesPutMapping6
} from 'es6/api/requestParams';
import {
    IndicesExists as IndicesExists7,
    IndicesPutMapping as IndicesPutMapping7
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
        return await this.client.indices
            .exists(
                isIndicesExists6(param)
                    ? param
                    : {
                          index: param.index
                      }
            )
            .then((value) => value.body as boolean);
    }

    async healthCheck(param?: ClusterHealth6): Promise<{ status: string }> {
        const healthCheck: ApiResponse = await this.client.cluster.health({ ...param });
        return { status: healthCheck.body.status };
    }

    async putMapping(param: IndicesPutMapping6 | IndicesPutMapping7) {
        return await this.client.indices.putMapping(
            isIndicesPutMapping6(param)
                ? param
                : {
                      index: param.index,
                      type: '_doc',
                      body: param.body
                  }
        );
    }

    async search<R>(index: string, query?: any) {
        return await this.client
            .search({
                index,
                body: query
            })
            .then((value: ApiResponse<IndexSearchResults6<R>>) =>
                value.body.hits.hits.map((hit) => hit._source as R)
            );
    }

    async putSetting(index: string, body: any): Promise<any> {
        return await this.client.indices.putSettings({
            index,
            body
        });
    }

    version(): string {
        return '6.x';
    }

    async close() {
        await this.client.close();
    }

    async postDocument(index: string, body?: any, id?: string) {
        return await this.client.index({
            type: '_doc',
            index,
            body,
            id
        });
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
