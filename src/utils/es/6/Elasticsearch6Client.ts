import { esConnectConf } from '../EsUtils';
import { Client } from 'es6';
import { ApiResponse } from 'es6/lib/Transport';
import { inject, injectable } from 'inversify';
import { Bindings } from '../../../ioc.bindings';
import ElasticsearchClient from '../ElasticsearchClient';
import { ESConfig, IndexSearchResults } from '../../../model/types';

@injectable()
class Elasticsearch6Client implements ElasticsearchClient {
    client: Client;

    constructor(
        @inject(Bindings.ESConfig)
        private readonly connectConf: ESConfig
    ) {
        this.client = new Client(esConnectConf(connectConf));
    }

    async createIndex(index: string, body?: any) {
        return await this.client.indices.create({
            index,
            body
        });
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
            .then((value: ApiResponse<IndexSearchResults<R>>) =>
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
        this.client.close();
    }
}

export default Elasticsearch6Client;
