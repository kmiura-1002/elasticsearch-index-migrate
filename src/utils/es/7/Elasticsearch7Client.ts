import { esConnectConf } from '../EsUtils';
import { Client } from 'es7';
import { ApiResponse } from 'es7/lib/Transport';
import { injectable, inject } from 'inversify';
import { Bindings } from '../../../ioc.bindings';
import ElasticsearchClient from '../ElasticsearchClient';
import { ESConnectConfig, IndexSearchResults7, SimpleJson } from '../../../model/types';
import { ClientOptions } from 'es7';
import {
    ClusterHealth,
    IndicesCreate,
    IndicesExists,
    IndicesPutMapping,
    IndicesPutSettings,
    Search
} from 'es7/api/requestParams';

@injectable()
class Elasticsearch7Client implements ElasticsearchClient {
    client: Client;

    public constructor(@inject(Bindings.ESConfig) connectConf: ESConnectConfig) {
        this.client = new Client(esConnectConf(connectConf) as ClientOptions);
    }

    createIndex(param: IndicesCreate) {
        return this.client.indices.create(param);
    }

    async exists(param: IndicesExists): Promise<boolean> {
        return await this.client.indices.exists(param).then((value) => value.body as boolean);
    }

    async healthCheck(param?: ClusterHealth): Promise<{ status: string }> {
        const healthCheck: ApiResponse = await this.client.cluster.health({ ...param });
        return { status: healthCheck.body.status };
    }

    async putMapping(param: IndicesPutMapping) {
        return this.client.indices.putMapping(param);
    }

    search<R>(param: Search) {
        return this.client
            .search(param)
            .then((value: ApiResponse<Record<string, IndexSearchResults7<R>>>) =>
                value.body.hits.hits.map((hit) => hit._source as R)
            );
    }

    async putSetting(param: IndicesPutSettings): Promise<any> {
        return this.client.indices.putSettings(param);
    }

    version(): string {
        return '7.x';
    }

    async close() {
        await this.client.close();
    }

    postDocument(index: string, body?: any, id?: string) {
        return this.client.index({
            type: '_doc',
            index,
            body,
            id
        });
    }

    delete(index: string | string[]) {
        return this.client.indices.delete({ index });
    }

    async getMapping(index: string): Promise<SimpleJson> {
        return await this.client.indices
            .getMapping({ index })
            .then((value) => value.body[index] as SimpleJson);
    }

    async get(index: string): Promise<SimpleJson> {
        return await this.client.indices.get({ index }).then((value) => value.body as SimpleJson);
    }

    deleteDocument(indexName: string, body: any): Promise<any> {
        return this.client.deleteByQuery({ index: indexName, body });
    }
}

export default Elasticsearch7Client;
