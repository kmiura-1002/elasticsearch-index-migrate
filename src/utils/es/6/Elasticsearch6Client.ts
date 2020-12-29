import { esConnectConf } from '../EsUtils';
import { Client } from 'es6';
import { ApiResponse } from 'es6/lib/Transport';
import { inject, injectable } from 'inversify';
import { Bindings } from '../../../ioc.bindings';
import ElasticsearchClient from '../ElasticsearchClient';
import { ESConnectConfig, IndexSearchResults6, SimpleJson } from '../../../model/types';
import { ClientOptions } from 'es6';
import { IndicesCreate as IndicesCreate6 } from 'es6/api/requestParams';

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

    async exists(index: string): Promise<boolean> {
        return await this.client.indices.exists({ index }).then((value) => value.body as boolean);
    }

    async healthCheck(): Promise<{ status: string }> {
        const healthCheck: ApiResponse = await this.client.cluster.health();
        return { status: healthCheck.body.status };
    }

    async putMapping(index: string, body: any) {
        return await this.client.indices.putMapping({
            index,
            type: '_doc',
            body
        });
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
