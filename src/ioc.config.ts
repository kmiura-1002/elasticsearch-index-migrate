import { Container } from 'inversify';
import * as config from 'config';
import { Bindings } from './ioc.bindings';
import Elasticsearch6Client from './utils/es/6/Elasticsearch6Client';
import Elasticsearch7Client from './utils/es/7/Elasticsearch7Client';
import ElasticsearchClient from './utils/es/ElasticsearchClient';
import { ESConfig } from './model/types';

function esClientBind(container: Container) {
    const esVersion = config.get<string>('elasticsearch.version');
    const connectConf = config.get<ESConfig>('elasticsearch');
    const versionRegex = /^([1-9]\d{0,4}|0)(\.(([1-9]\d{0,4})|0)){0,3}$/;
    container.bind<ESConfig>(Bindings.ESConfig).toConstantValue(connectConf);
    const versionMatch = esVersion.match(versionRegex);

    if (versionMatch) {
        const v = versionMatch[1];
        switch (v) {
            case '6':
                container
                    .bind<ElasticsearchClient>(Bindings.ElasticsearchClient)
                    .to(Elasticsearch6Client);
                break;
            case '7':
                container
                    .bind<ElasticsearchClient>(Bindings.ElasticsearchClient)
                    .to(Elasticsearch7Client);
                break;
            default:
                throw new Error(`${esVersion} is unsupported. support version is 6.x or 7.x.`);
        }
    } else {
        throw new Error(`Unknown version:${esVersion}. support version is 6.x or 7.x.`);
    }
}

const container = new Container();
esClientBind(container);

export { container };
