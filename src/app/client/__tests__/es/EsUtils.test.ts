import { mocked } from 'jest-mock';

jest.mock('fs', () => ({
    readFileSync: jest.fn(() => `first¥n second¥n third`)
}));
import fs from 'fs';
import { ESConfig, ESConnectConfig } from '../../../types';
import getElasticsearchClient, {
    esClientBind,
    esConnectConf,
    usedEsVersion
} from '../../es/EsUtils';

describe('EsUtils', () => {
    it('can be connect when cloud id access', () => {
        const conf: ESConnectConfig = {
            cloudId: 'cloudId',
            username: 'username',
            password: 'password'
        };
        expect(esConnectConf(conf)).toEqual({
            cloud: {
                id: conf.cloudId,
                username: conf.username,
                password: conf.password
            }
        });
    });

    it('can be connect when ssl access', () => {
        const conf: ESConnectConfig = {
            host: 'host',
            sslCa: 'sslCa'
        };
        const buffer = Buffer.alloc(1);
        mocked(fs.readFileSync).mockImplementation(() => buffer);
        const connectConf = esConnectConf(conf);

        expect(fs.readFileSync).toHaveBeenCalledTimes(1);
        expect(connectConf).toEqual({
            node: conf.host,
            ssl: {
                ca: buffer
            }
        });
    });

    it('can be connect when host access', () => {
        const conf: ESConnectConfig = {
            host: 'host'
        };
        expect(esConnectConf(conf)).toEqual({
            node: conf.host
        });
    });

    it('can not be connect when unsupported version', () => {
        const esConfig: ESConfig = {
            version: '1.0.0',
            connect: {
                host: 'host'
            }
        };
        expect(() => esClientBind(esConfig)).toThrow(
            '1.0.0 is unsupported. support version is 6.x or 7.x.'
        );
    });

    it('can not be connect when Unknown version', () => {
        const esConfig: ESConfig = {
            version: 'version',
            connect: {
                host: 'host'
            }
        };

        expect(() => esClientBind(esConfig)).toThrow(
            'Unknown version:version. support version is 6.x or 7.x.'
        );
    });

    it('can be connect when version is es6', () => {
        const esConfig: ESConfig = {
            version: '6.0.0',
            connect: {
                host: 'http://0.0.0.0:9200'
            }
        };

        const client = getElasticsearchClient(esConfig);
        expect(client.version()).toEqual('6.x');
    });

    it('can be connect when version is es7', () => {
        const esConfig: ESConfig = {
            version: '7.0.0',
            connect: {
                host: 'http://0.0.0.0:9200'
            }
        };

        const client = getElasticsearchClient(esConfig);
        expect(client.version()).toEqual('7.x');
    });

    it('can get the ES version in use', () => {
        expect(usedEsVersion('6.0.1')).toEqual({
            engine: 'Elasticsearch',
            major: 6,
            minor: 0,
            patch: 1
        });
        expect(usedEsVersion('7.0.1')).toEqual({
            engine: 'Elasticsearch',
            major: 7,
            minor: 0,
            patch: 1
        });
        expect(usedEsVersion('7')).toEqual({
            engine: 'Elasticsearch',
            major: 7,
            minor: 0,
            patch: 0
        });
        expect(usedEsVersion('opensearch')).toEqual({
            engine: 'OpenSearch',
            major: 1,
            minor: 0,
            patch: 0
        });
        expect(usedEsVersion('foo')).toEqual(undefined);
    });
});
