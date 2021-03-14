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

describe('loadMigrationScriptFilePaths', () => {
    it('return path when args is indexName and migrationFilePaths', () => {
        const paths = loadMigrationScriptFilePaths('test1', [
            `${process.cwd()}/test/data/migration/indices/test1/v1.0.0__test1.json`
        ]);
        expect(paths).to.be.an('array').to.lengthOf(1);
        expect(paths[0].name).eq('v1.0.0__test1');
    });

    it('loadMigrationScriptFilePaths  is indexName and migrationFilePaths, indexVersion', () => {
        const paths = loadMigrationScriptFilePaths(
            'test1',
            [`${process.cwd()}/test/data/migration/indices/test1/1970.01.01/v1.0.0__test1.json`],
            '1970.01.01'
        );
        expect(paths).to.be.an('array').to.lengthOf(1);
        expect(paths[0].name).eq('v1.0.0__test1');
    });
});

describe('fileUtils test', () => {
    it('findFiles test', () => {
        const fsMock = sinon.mock(fs);
        fsMock.expects('readdirSync').once().returns(['test.text']);
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
});
