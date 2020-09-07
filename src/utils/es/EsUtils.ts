import 'reflect-metadata';
import { ClientOptions as ClientOptions6 } from 'es6';
import { ClientOptions as ClientOptions7 } from 'es7';
import fs from 'fs';
import { Bindings } from '../../ioc.bindings';
import ElasticsearchClient from './ElasticsearchClient';
import { ElasticsearchVersions, ESConfig, ESConnectConfig } from '../../model/types';
import { Container } from 'inversify';
import Elasticsearch6Client from './6/Elasticsearch6Client';
import Elasticsearch7Client from './7/Elasticsearch7Client';
import major from 'semver/functions/major';
import minor from 'semver/functions/minor';
import patch from 'semver/functions/patch';
import valid from 'semver/functions/valid';

export function usedEsVersion(v?: string): ElasticsearchVersions | undefined {
    return valid(v)
        ? {
              major: major(v ?? ''),
              minor: minor(v ?? ''),
              patch: patch(v ?? '')
          }
        : undefined;
}

export function esClientBind(esConfig: ESConfig) {
    const container = new Container();
    container.bind<ESConnectConfig>(Bindings.ESConfig).toConstantValue(esConfig.connect);

    const version = valid(esConfig.version);
    if (version) {
        switch (usedEsVersion(version)?.major) {
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

export default function getElasticsearchClient(esConfig: ESConfig) {
    const container = esClientBind(esConfig);
    return container.get<ElasticsearchClient>(Bindings.ElasticsearchClient);
}

export function esConnectConf(conf: ESConnectConfig): ClientOptions6 | ClientOptions7 {
    const { host, sslCa, cloudId, username, password } = conf;
    let opts: ClientOptions6 | ClientOptions7;
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
    return opts;
}
