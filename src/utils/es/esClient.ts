import * as fs from 'fs';
import { Client as Client6, ClientOptions } from 'es6';
import { Client as Client7 } from 'es7';
import {ESClient} from "eim";

export enum ESVersion {
    ES6 = 'ES6',
    ES7 = 'ES7'
}

export type ESConfig = {
    esVersion: ESVersion;
    host?: string;
    sslCa?: string;
    cloudId?: string;
    username?: string;
    password?: string;
};

export default function esClient(conf: ESConfig): ESClient {
    const { host, sslCa, cloudId, username, password } = conf;
    let opts: ClientOptions;
    if (
        cloudId !== undefined &&
        cloudId !== null &&
        username !== undefined &&
        username !== null &&
        password !== undefined &&
        password !== null
    ) {
        opts = {
            cloud: {
                id: cloudId,
                username: username,
                password: password
            }
        };
    } else if (sslCa !== undefined && sslCa !== null) {
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
    return conf.esVersion === ESVersion.ES6 ? new Client6(opts) : new Client7(opts);
}
