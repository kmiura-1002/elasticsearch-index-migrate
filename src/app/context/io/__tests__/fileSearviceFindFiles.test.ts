import fs from 'fs';
import { MockStats } from '../../../../__mocks__/common/MockStats';
import { findFiles } from '../fileService';
import { mocked } from 'jest-mock';

jest.mock('fs');

describe('fileService', () => {
    it('can find files', () => {
        // @ts-ignore
        mocked(fs.readdirSync).mockImplementationOnce((args) => ['test.text']);
        mocked(fs.statSync).mockImplementationOnce((args) => new MockStats());
        findFiles('', (data) => {
            expect(data).toEqual('test.text');
        });
    });

    // it('loadMigrationScripts test', () => {
    //   const scripts = loadMigrationScripts([
    //     {
    //       root: '/',
    //       dir: `${process.cwd()}/test/data/migration/indices/test1`,
    //       base: 'v1.0.0__test1.json',
    //       ext: '.json',
    //       name: 'v1.0.0__test1'
    //     }
    //   ]);
    //   expect(scripts).to.be.an('array').to.lengthOf(1);
    //   expect(scripts[0]).is.deep.eq({
    //     type: 'ADD_FIELD',
    //     description: 'description',
    //     migrate_script: {
    //       properties: {
    //         num: {
    //           type: 'long'
    //         }
    //       }
    //     },
    //     physicalLocation: {
    //       root: '/',
    //       dir: `${process.cwd()}/test/data/migration/indices/test1`,
    //       base: 'v1.0.0__test1.json',
    //       ext: '.json',
    //       name: 'v1.0.0__test1'
    //     },
    //     version: 'v1.0.0'
    //   });
    // });
});
