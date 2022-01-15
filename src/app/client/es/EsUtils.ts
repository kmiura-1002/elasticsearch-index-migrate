import { ClientOptions as ClientOptions6 } from 'es6';
import { ClientOptions as ClientOptions7 } from 'es7';
import fs from 'fs';
import { Engine, ESConnectConfig, SearchEngineVersion } from '../../types';
import major from 'semver/functions/major';
import minor from 'semver/functions/minor';
import patch from 'semver/functions/patch';
import valid from 'semver/functions/valid';
import coerce from 'semver/functions/coerce';

export function usedEsVersion(engine: Engine): SearchEngineVersion | undefined {
    const version = coerce(engine.version);
    if (engine.searchEngine === 'opensearch') {
        return valid(version) && version
            ? {
                  engine: 'OpenSearch',
                  major: major(version),
                  minor: minor(version),
                  patch: patch(version)
              }
            : undefined;
    } else if (engine.searchEngine === 'elasticsearch') {
        return valid(version) && version
            ? {
                  engine: 'Elasticsearch',
                  major: major(version),
                  minor: minor(version),
                  patch: patch(version)
              }
            : undefined;
    }
    throw new Error(`Unknown search engine: ${engine}`);
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
