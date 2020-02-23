import 'mocha';
import * as fs from 'fs';
import { expect } from 'chai';
import * as sinon from 'sinon';
import {
    findAllFiles,
    findFiles,
    loadMigrationScriptFilePaths,
    loadMigrationScripts
} from '../../src/utils/fileUtils';
import { MockStats } from '../data/mock/MockStats';

describe('fileUtils test', () => {
    it('findFiles test', () => {
        const fsMock = sinon.mock(fs);
        fsMock
            .expects('readdirSync')
            .once()
            .returns(['test.text']);
        fsMock
            .expects('statSync')
            .once()
            .returns(new MockStats());
        findFiles('', (data) => {
            expect(data).to.eq('test.text');
        });
        fsMock.verify();
    });

    it('findAllFiles test', () => {
        const fsMock = sinon.mock(fs);
        fsMock
            .expects('readdirSync')
            .once()
            .returns(['test.text']);
        fsMock
            .expects('statSync')
            .once()
            .returns(new MockStats());
        const paths = findAllFiles(['']);
        expect(paths)
            .to.be.an('array')
            .to.lengthOf(1)
            .to.include(`${process.cwd()}/test.text`);
        fsMock.verify();
    });

    it('loadMigrationScriptFilePaths test', () => {
        const paths = loadMigrationScriptFilePaths('test1', [
            `${process.cwd()}/migration/indices/test1/v1.0.0__test1.json`
        ]);
        expect(paths)
            .to.be.an('array')
            .to.lengthOf(1);
        expect(paths[0].name).eq('v1.0.0__test1');
    });

    it('loadMigrationScripts test', () => {
        const scripts = loadMigrationScripts([
            {
                root: '/',
                dir: `${process.cwd()}/migration/indices/test1`,
                base: 'v1.0.0__test1.json',
                ext: '.json',
                name: 'v1.0.0__test1'
            }
        ]);
        expect(scripts)
            .to.be.an('array')
            .to.lengthOf(1);
        expect(scripts[0]).is.deep.eq({
            type: 'ADD_FIELD',
            index_name: 'test',
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
                dir: `${process.cwd()}/migration/indices/test1`,
                base: 'v1.0.0__test1.json',
                ext: '.json',
                name: 'v1.0.0__test1'
            },
            version: 'v1.0.0'
        });
    });
});
