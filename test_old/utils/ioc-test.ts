import ElasticsearchClient from '../../src/client/es/ElasticsearchClient';
import Elasticsearch6Client from '../../src/client/es/6/Elasticsearch6Client';
import { Container } from 'inversify';
import { Bindings } from '../../src/ioc.bindings';
import Elasticsearch7Client from '../../src/client/es/7/Elasticsearch7Client';
import { ESConnectConfig } from '../../src/model/types';

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
