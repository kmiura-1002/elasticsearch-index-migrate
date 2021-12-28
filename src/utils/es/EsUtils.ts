import 'reflect-metadata';
import { ClientOptions as ClientOptions6 } from 'es6';
import { ClientOptions as ClientOptions7 } from 'es7';
import fs from 'fs';
import { Bindings } from '../../ioc.bindings';
import ElasticsearchClient from './ElasticsearchClient';
import { ESConfig, ESConnectConfig, OPENSEARCH, SearchEngineVersion } from '../../model/types';
import { Container } from 'inversify';
import Elasticsearch6Client from './6/Elasticsearch6Client';
import Elasticsearch7Client from './7/Elasticsearch7Client';
import major from 'semver/functions/major';
import minor from 'semver/functions/minor';
import patch from 'semver/functions/patch';
import valid from 'semver/functions/valid';
import coerce from 'semver/functions/coerce';
import { ClientOptions } from '@opensearch-project/opensearch';
import OpenSearchClient from './opensearch/OpenSearchClient';

export function usedEsVersion(v?: string): SearchEngineVersion | undefined {
    if (v === OPENSEARCH) {
        return {
            engine: 'OpenSearch',
            major: 1,
            minor: 0,
            patch: 0
        };
    }
    const version = coerce(v);
    return valid(version) && version
        ? {
              engine: 'Elasticsearch',
              major: major(version),
              minor: minor(version),
              patch: patch(version)
          }
        : undefined;
}

export function esClientBind(esConfig: ESConfig): Container {
    const container = new Container();
    container.bind<ESConnectConfig>(Bindings.ESConfig).toConstantValue(esConfig.connect);

    if (esConfig.version === OPENSEARCH) {
        container.bind<ElasticsearchClient>(Bindings.ElasticsearchClient).to(OpenSearchClient);
        return container;
    }

    const version = usedEsVersion(esConfig.version)?.major;
    if (version) {
        switch (version) {
            case 6:
                container
                    .bind<ElasticsearchClient>(Bindings.ElasticsearchClient)
                    .to(Elasticsearch6Client);
                break;
            case 7:
                container
                    .bind<ElasticsearchClient>(Bindings.ElasticsearchClient)
                    .to(Elasticsearch7Client);
                break;
            default:
                throw new Error(
                    `${esConfig.version} is unsupported. support version is 6.x or 7.x.`
                );
        }
        return container;
    } else {
        throw new Error(`Unknown version:${esConfig.version}. support version is 6.x or 7.x.`);
    }
}

export default function getElasticsearchClient(esConfig: ESConfig): ElasticsearchClient {
    const container = esClientBind(esConfig);
    return container.get<ElasticsearchClient>(Bindings.ElasticsearchClient);
}

export function esConnectConf(
    conf: ESConnectConfig
): ClientOptions6 | ClientOptions7 | ClientOptions {
    const { host, sslCa, cloudId, username, password, insecure } = conf;
    let opts: ClientOptions6 | ClientOptions7 | ClientOptions;
    if (cloudId && username && password) {
        opts = {
            cloud: {
                id: cloudId,
                username: username,
                password: password
            }
        };
    } else if (sslCa && host) {
        opts = {
            node: host,
            ssl: {
                ca: fs.readFileSync(sslCa)
            }
        };
    } else {
        opts = {
            node: host
        };
    }
    if (insecure !== undefined) {
        opts = { ...opts, ssl: { ...opts.ssl, rejectUnauthorized: !insecure } };
    }
    return opts;
}
