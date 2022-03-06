import { findAllFiles } from '../fileService';

describe('fileService', () => {
    it('can find all files', () => {
        const paths = findAllFiles([
            `${process.cwd()}/src/__mocks__/testsData/migration/indices/test1`
        ]);
        expect(paths).toHaveLength(2);
        expect(paths).toEqual([
            `${process.cwd()}/src/__mocks__/testsData/migration/indices/test1/1970.01.01/v1.0.0__test1.json`,
            `${process.cwd()}/src/__mocks__/testsData/migration/indices/test1/v1.0.0__test1.json`
        ]);
    });
});
