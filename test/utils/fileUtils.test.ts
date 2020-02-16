import 'mocha';
import * as fs from 'fs';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { findAllFiles, findFiles } from '../../src/utils/fileUtils';
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
});
