import OldElasticsearchClient from '../app/client/es/ElasticsearchClient';
import Elasticsearch6Client from '../app/client/es/6/Elasticsearch6Client';
import { Container } from 'inversify';
import Elasticsearch7Client from '../app/client/es/7/Elasticsearch7Client';
import { ESConnectConfig } from '../app/types';
import { Bindings } from '../app/ioc.bindings';

export function es6ClientContainer() {
    const container = new Container();
    container.bind<ESConnectConfig>(Bindings.ESConfig).toConstantValue({
        host: 'http://localhost:9201'
    });
    container.bind<OldElasticsearchClient>(Bindings.ElasticsearchClient).to(Elasticsearch6Client);
    return container;
}

export function es7ClientContainer() {
    const container = new Container();
    container.bind<ESConnectConfig>(Bindings.ESConfig).toConstantValue({
        host: 'http://localhost:9202'
    });
    container.bind<OldElasticsearchClient>(Bindings.ElasticsearchClient).to(Elasticsearch7Client);
    return container;
}
