import fs from 'fs';
import major from 'semver/functions/major';
import minor from 'semver/functions/minor';
import patch from 'semver/functions/patch';
import valid from 'semver/functions/valid';
import coerce from 'semver/functions/coerce';
import type { Engine, ESConnectConfig, SearchEngineVersion } from '../../types';
import type { ClientOptions as ClientOptions6 } from 'es6';
import { Client as Es6Client } from 'es6';
import type { ClientOptions as ClientOptions7 } from 'es7';
import { Client as Es7Client } from 'es7';
import { UnsupportedVersionError } from '../../error/UnsupportedVersionError';
import { Generic as Generic6 } from 'es6/api/requestParams';
import { Generic as Generic7 } from 'es7/api/requestParams';
import { RequestBase } from 'es8/lib/api/types';
import { Client as Es8Client } from 'es8';

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

export function isE6Client<
    ES6Request extends Generic6,
    ES7Request extends Generic7,
    ES8Request extends RequestBase
>(
    param: {
        client: Es6Client | Es7Client | Es8Client;
        request?: ES6Request | ES7Request | ES8Request;
    },
    version: SearchEngineVersion
): param is { client: Es6Client; request: ES6Request } {
    return version.major === 6;
}

export function isE7Client<
    ES6Request extends Generic6,
    ES7Request extends Generic7,
    ES8Request extends RequestBase
>(
    param: {
        client: Es6Client | Es7Client | Es8Client;
        request?: ES6Request | ES7Request | ES8Request;
    },
    version: SearchEngineVersion
): param is { client: Es7Client; request: ES7Request } {
    return version.major === 7;
}

export function isE8Client<
    ES6Request extends Generic6,
    ES7Request extends Generic7,
    ES8Request extends RequestBase
>(
    param: {
        client: Es6Client | Es7Client | Es8Client;
        request?: ES6Request | ES7Request | ES8Request;
    },
    version: SearchEngineVersion
): param is { client: Es8Client; request: ES8Request } {
    return version.major === 8;
}
