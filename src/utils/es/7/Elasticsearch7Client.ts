import { esConnectConf } from '../EsUtils';
import { ESConfig, IndexSearchResults } from 'eim';
import { Client } from 'es7';
import { ApiResponse } from 'es7/lib/Transport';
import { injectable, inject } from 'inversify';
import { Bindings } from '../../../ioc.bindings';
import ElasticsearchClient from '../ElasticsearchClient';

@injectable()
class Elasticsearch7Client implements ElasticsearchClient {
    client: Client;

    public constructor(@inject(Bindings.ESConfig) connectConf: ESConfig) {
        this.client = new Client(esConnectConf(connectConf));
    }

    async createIndex(index: string, body: any) {
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
            body
        });
    }

    async search<R>(index: string, query: any) {
        return await this.client
            .search({
                index,
                body: query
            })
            .then((value: ApiResponse<IndexSearchResults<R>>) =>
                value.body.hits.hits.map((hit) => hit._source)
            );
    }

    test(): string {
        return 'es7';
    }
}

export default Elasticsearch7Client;
