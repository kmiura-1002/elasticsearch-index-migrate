import 'mocha';
import * as fs from 'fs';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { ESConfig } from '../../src/model/types';
import { esConnectConf } from '../../src/utils/es/EsUtils';

describe('EsUtils test', () => {
    it('cloud connect conf test', () => {
        const conf: ESConfig = {
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
        const conf: ESConfig = {
            host: 'host',
            sslCa: 'sslCa'
        };
        const buffer = new Buffer(1);
        const fsMock = sinon.mock(fs);
        fsMock
            .expects('readFileSync')
            .once()
            .returns(buffer);
        expect(esConnectConf(conf)).is.deep.eq({
            node: conf.host,
            ssl: {
                ca: buffer
            }
        });
    });

    it('node connect conf test', () => {
        const conf: ESConfig = {
            host: 'host'
        };
        expect(esConnectConf(conf)).is.deep.eq({
            node: conf.host
        });
    });
});
