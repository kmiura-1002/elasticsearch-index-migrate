import 'mocha';
import fs from 'fs';
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
            version: '1.0.0',
            connect: {
                host: 'host'
            }
        };
        expect(() => esClientBind(esConfig)).to.throw(
            '1.0.0 is unsupported. support version is 6.x or 7.x.'
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
            version: '6.0.0',
            connect: {
                host: 'http://0.0.0.0:9200'
            }
        };

        const client = getElasticsearchClient(esConfig);
        expect(client.version()).to.eq('6.x');
    });

    it('get es7 connect', () => {
        const esConfig: ESConfig = {
            version: '7.0.0',
            connect: {
                host: 'http://0.0.0.0:9200'
            }
        };

        const client = getElasticsearchClient(esConfig);
        expect(client.version()).to.eq('7.x');
    });

    it('The number of the major version to be returned', () => {
        expect(usedEsVersion('6.0.1')).is.deep.eq({
            major: 6,
            minor: 0,
            patch: 1
        });
        expect(usedEsVersion('7.0.1')).is.deep.eq({
            major: 7,
            minor: 0,
            patch: 1
        });
        expect(usedEsVersion('foo')).is.eq(undefined);
    });
});
