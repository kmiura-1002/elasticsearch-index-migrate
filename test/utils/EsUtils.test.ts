import 'mocha';
import * as fs from 'fs';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { ESConfig, ESConnectConfig } from '../../src/model/types';
import getElasticsearchClient, {
    esClientBind,
    esConnectConf,
    usedEsVersion
} from '../../src/utils/es/EsUtils';

describe('EsUtils test', () => {
    let sandbox: sinon.SinonSandbox;
    before(() => {
        sandbox = sinon.createSandbox();
    });
    afterEach(() => {
        sandbox.restore();
    });

    it('cloud connect conf test', () => {
        const conf: ESConnectConfig = {
            cloudId: 'cloudId',
            username: 'username',
            password: 'password'
        };
        expect(esConnectConf(conf)).is.deep.eq({
            cloud: {
                id: conf.cloudId,
                username: conf.username,
                password: conf.password
            }
        });
    });

    it('ssl connect conf test', () => {
        const conf: ESConnectConfig = {
            host: 'host',
            sslCa: 'sslCa'
        };
        const buffer = new Buffer(1);
        const stub = sandbox.stub(fs, 'readFileSync').returns(buffer);
        const connectConf = esConnectConf(conf);

        expect(stub.calledOnce).is.true;
        expect(connectConf).is.deep.eq({
            node: conf.host,
            ssl: {
                ca: buffer
            }
        });
    });

    it('node connect conf test', () => {
        const conf: ESConnectConfig = {
            host: 'host'
        };
        expect(esConnectConf(conf)).is.deep.eq({
            node: conf.host
        });
    });

    it('get es connect failed:unsupported version', () => {
        const esConfig: ESConfig = {
            version: '1',
            connect: {
                host: 'host'
            }
        };
        expect(() => esClientBind(esConfig)).to.throw(
            '1 is unsupported. support version is 6.x or 7.x.'
        );
    });

    it('get es connect failed:Unknown version', () => {
        const esConfig: ESConfig = {
            version: 'version',
            connect: {
                host: 'host'
            }
        };

        expect(() => esClientBind(esConfig)).throw(
            'Unknown version:version. support version is 6.x or 7.x.'
        );
    });

    it('get es6 connect', () => {
        const esConfig: ESConfig = {
            version: '6',
            connect: {
                host: 'http://0.0.0.0:9200'
            }
        };

        const client = getElasticsearchClient(esConfig);
        expect(client.version()).to.eq('6.x');
    });

    it('get es7 connect', () => {
        const esConfig: ESConfig = {
            version: '7',
            connect: {
                host: 'http://0.0.0.0:9200'
            }
        };

        const client = getElasticsearchClient(esConfig);
        expect(client.version()).to.eq('7.x');
    });

    it('The number of the major version to be returned', () => {
        expect(
            usedEsVersion({
                version: '6.0.1',
                connect: {
                    host: 'http://0.0.0.0:9201'
                }
            })
        ).is.eq('6');
        expect(
            usedEsVersion({
                version: '7.0.1',
                connect: {
                    host: 'http://0.0.0.0:9201'
                }
            })
        ).is.eq('7');
        expect(
            usedEsVersion({
                version: 'foo',
                connect: {
                    host: 'http://0.0.0.0:9201'
                }
            })
        ).is.eq(undefined);
    });
});
