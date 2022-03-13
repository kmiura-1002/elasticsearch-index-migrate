import { mocked } from 'jest-mock';

jest.mock('fs', () => ({
    readFileSync: jest.fn(() => `first¥n second¥n third`)
}));
import fs from 'fs';
import { esConnectConf, usedEsVersion } from '../../es/EsUtils';
import type { ESConnectConfig } from '../../../types';

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

    it('can get the ES version in use', () => {
        expect(
            usedEsVersion({
                version: '6.0.1',
                searchEngine: 'elasticsearch'
            })
        ).toEqual({
            engine: 'Elasticsearch',
            major: 6,
            minor: 0,
            patch: 1
        });
        expect(
            usedEsVersion({
                version: '7.0.1',
                searchEngine: 'elasticsearch'
            })
        ).toEqual({
            engine: 'Elasticsearch',
            major: 7,
            minor: 0,
            patch: 1
        });
        expect(
            usedEsVersion({
                version: '7',
                searchEngine: 'elasticsearch'
            })
        ).toEqual({
            engine: 'Elasticsearch',
            major: 7,
            minor: 0,
            patch: 0
        });
        expect(usedEsVersion({ version: '1', searchEngine: 'opensearch' })).toEqual({
            engine: 'OpenSearch',
            major: 1,
            minor: 0,
            patch: 0
        });
        expect(() =>
            usedEsVersion({
                version: '',
                searchEngine: 'opensearch'
            })
        ).toThrowError(new Error('Invalid version of elasticsearch. version:null'));
    });
});
