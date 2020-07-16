import 'mocha';
import fs from 'fs';
import { expect } from 'chai';
import * as sinon from 'sinon';
import {
    findAllFiles,
    findFiles,
    loadMigrationScriptFilePaths,
    loadMigrationScripts
} from '../../src/utils/fileUtils';
import { MockStats } from '../mock/MockStats';
import { cli } from 'cli-ux';

describe('fileUtils test', () => {
    let sandbox: sinon.SinonSandbox;
    before(() => {
        sandbox = sinon.createSandbox();
    });
    afterEach(() => {
        sandbox.restore();
    });

    it('findFiles test', () => {
        const fsMock = sinon.mock(fs);
        fsMock.expects('readdirSync').once().returns(['test.text']);
        fsMock.expects('existsSync').once().returns(true);
        fsMock.expects('statSync').once().returns(new MockStats());
        findFiles('', (data) => {
            expect(data).to.eq('test.text');
        });
        fsMock.verify();
        fsMock.restore();
    });

    it('findAllFiles test', () => {
        const paths = findAllFiles([`${process.cwd()}/test/data/migration/indices/test1`]);
        expect(paths)
            .to.be.an('array')
            .to.lengthOf(1)
            .to.include(`${process.cwd()}/test/data/migration/indices/test1/v1.0.0__test1.json`);
    });

    it('loadMigrationScriptFilePaths test', () => {
        const paths = loadMigrationScriptFilePaths('test1', [
            `${process.cwd()}/test/data/migration/indices/test1/v1.0.0__test1.json`
        ]);
        expect(paths).to.be.an('array').to.lengthOf(1);
        expect(paths[0].name).eq('v1.0.0__test1');
    });

    it('loadMigrationScripts test', () => {
        const scripts = loadMigrationScripts([
            {
                root: '/',
                dir: `${process.cwd()}/test/data/migration/indices/test1`,
                base: 'v1.0.0__test1.json',
                ext: '.json',
                name: 'v1.0.0__test1'
            }
        ]);
        expect(scripts).to.be.an('array').to.lengthOf(1);
        expect(scripts[0]).is.deep.eq({
            type: 'ADD_FIELD',
            description: 'description',
            migrate_script: {
                properties: {
                    num: {
                        type: 'long'
                    }
                }
            },
            physicalLocation: {
                root: '/',
                dir: `${process.cwd()}/test/data/migration/indices/test1`,
                base: 'v1.0.0__test1.json',
                ext: '.json',
                name: 'v1.0.0__test1'
            },
            version: 'v1.0.0'
        });
    });

    it('Error when a file or directory is missing', () => {
        const error = sandbox.stub(cli, 'error');
        expect(() => findFiles('', (_data) => {})).to.throw('no such file or directory: ');
        expect(error.calledOnce).is.true;
        expect(error.calledWith('no such file or directory: ')).is.true;
    });
});
