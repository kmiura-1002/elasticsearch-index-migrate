import ElasticsearchClient from '../../src/utils/es/ElasticsearchClient';
import Elasticsearch6Client from '../../src/utils/es/6/Elasticsearch6Client';
import { Container } from 'inversify';
import { Bindings } from '../../src/ioc.bindings';
import Elasticsearch7Client from '../../src/utils/es/7/Elasticsearch7Client';
import { ESConnectConfig } from '../../src/model/types';
import OpenSearchClient from '../../src/utils/es/opensearch/OpenSearchClient';

export function es6ClientContainer() {
    const container = new Container();
    container.bind<ESConnectConfig>(Bindings.ESConfig).toConstantValue({
        host: 'http://localhost:9201'
    });
    container.bind<ElasticsearchClient>(Bindings.ElasticsearchClient).to(Elasticsearch6Client);
    return container;
}

export function es7ClientContainer() {
    const container = new Container();
    container.bind<ESConnectConfig>(Bindings.ESConfig).toConstantValue({
        host: 'http://localhost:9202'
    });
    container.bind<ElasticsearchClient>(Bindings.ElasticsearchClient).to(Elasticsearch7Client);
    return container;
}

export function openSearchClientContainer() {
    const container = new Container();
    container.bind<ESConnectConfig>(Bindings.ESConfig).toConstantValue({
        host: 'http://localhost:9202'
    });
    container.bind<ElasticsearchClient>(Bindings.ElasticsearchClient).to(OpenSearchClient);
    return container;
}
