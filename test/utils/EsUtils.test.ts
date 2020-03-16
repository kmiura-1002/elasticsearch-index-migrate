import 'mocha';
import * as fs from 'fs';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { ESConnectConfig } from '../../src/model/types';
import { esConnectConf } from '../../src/utils/es/EsUtils';

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
});
