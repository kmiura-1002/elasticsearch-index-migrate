import {ESConfig} from 'eim';
import 'reflect-metadata';
import {ClientOptions as ClientOptions6} from 'es6';
import {ClientOptions as ClientOptions7} from 'es7';
import * as fs from 'fs';
import {Bindings} from "../../ioc.bindings";
import {container} from "../../ioc.config";
import ElasticsearchClient from "./ElasticsearchClient";


export default function getElasticsearchClient() {
    return container.get<ElasticsearchClient>(Bindings.ElasticsearchClient);
}

export function esConnectConf(conf: ESConfig) {
    const {host, sslCa, cloudId, username, password} = conf;
    let opts: ClientOptions6 | ClientOptions7;
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
    return opts;
}
