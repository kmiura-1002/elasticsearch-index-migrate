import fs from 'fs';
import major from 'semver/functions/major';
import minor from 'semver/functions/minor';
import patch from 'semver/functions/patch';
import valid from 'semver/functions/valid';
import coerce from 'semver/functions/coerce';
import type { Engine, ESConnectConfig, SearchEngineVersion } from '../../types';
import type { ClientOptions as ClientOptions6 } from 'es6';
import type { ClientOptions as ClientOptions7 } from 'es7';
import { UnsupportedVersionError } from '../../context/error/UnsupportedVersionError';

export function usedEsVersion(engine: Engine): SearchEngineVersion {
    const version = coerce(engine.version);
    if (!valid(version) || !version) {
        throw new UnsupportedVersionError(`Invalid version of elasticsearch. version:${version}`);
    } else {
        if (engine.searchEngine === 'opensearch') {
            return {
                engine: 'OpenSearch',
                major: major(version),
                minor: minor(version),
                patch: patch(version)
            };
        } else if (engine.searchEngine === 'elasticsearch') {
            return {
                engine: 'Elasticsearch',
                major: major(version),
                minor: minor(version),
                patch: patch(version)
            };
        }
        throw new UnsupportedVersionError(`Unknown search engine: ${engine}`);
    }
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
