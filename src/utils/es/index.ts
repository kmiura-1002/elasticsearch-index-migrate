import { ESConfig } from 'eim';
import 'reflect-metadata';
import { ClientOptions as ClientOptions6 } from 'es6';
import { ClientOptions as ClientOptions7 } from 'es7';
import * as fs from 'fs';
import * as config from 'config';
import { Container } from 'inversify';
import Elasticsearch6Client from './6/Elasticsearch6Client';
import Elasticsearch7Client from './7/Elasticsearch7Client';

export enum TYPES {
    ElasticsearchClient = 'ElasticsearchClient',
    ESConfig = 'ESConfig'
}

export default function getElasticsearchClient() {
    console.log('weare');
    const esVersion = config.get<string>('elasticsearch.version');
    const connectConf = config.get<ESConfig>('elasticsearch');
    const versionRegex = /^([1-9]\d{0,4}|0)(\.(([1-9]\d{0,4})|0)){0,3}$/;
    const container = new Container();
    container.bind<ESConfig>(TYPES.ESConfig).toConstantValue(connectConf);
    const versionMatch = esVersion.match(versionRegex);
    console.log('versionMatch', versionMatch);
    if (versionMatch) {
        const v = versionMatch[1];
        switch (v) {
            case '6':
                container
                    .bind<ElasticsearchClient>(TYPES.ElasticsearchClient)
                    .to(Elasticsearch6Client);
                break;
            case '7':
                container
                    .bind<ElasticsearchClient>(TYPES.ElasticsearchClient)
                    .to(Elasticsearch7Client);
                break;
            default:
                throw new Error(`${esVersion} is unsupported. support version is 6.x or 7.x.`);
        }
        return container.get<ElasticsearchClient>(TYPES.ElasticsearchClient);
    }
    throw new Error(`Unknown version:${esVersion}. support version is 6.x or 7.x.`);
}

export interface ElasticsearchClient {
    healthCheck(): Promise<{ status: string }>;

    putMapping(index: string, body: any): Promise<any>;

    createIndex(index: string, body: any): Promise<any>;

    search(index: string, query: any): Promise<any>;

    exists(index: string): boolean;

    test(): string;
}

export function esConnectConf(conf: ESConfig) {
    const { host, sslCa, cloudId, username, password } = conf;
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
