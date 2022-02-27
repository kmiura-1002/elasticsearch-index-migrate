import { fancyIt } from '../../../__mocks__/fancyIt';
import { mocked } from 'jest-mock';
import { readOptions } from '../../config/flags/flagsLoader';
import useElasticsearchClient from '../../client/es/ElasticsearchClient';
import { getFakeCommand } from '../../../__mocks__/command/fakeCommand';
import { CliUx } from '@oclif/core';
import { migrateLock } from '../migrateLock';
import { mockReadOptions } from '../../../__mocks__/flags/mockReadOptions';
import { getMockElasticsearchClient } from '../../../__mocks__/client/es/mockElasticsearchClient';

jest.mock('../../config/flags/flagsLoader');
jest.mock('../../client/es/ElasticsearchClient');
const spyError = jest.spyOn(CliUx.ux, 'error');

describe('migrateLock', () => {
    beforeEach(() => {
        mocked(readOptions).mockClear();
        mocked(useElasticsearchClient).mockClear();
        mocked(spyError).mockClear();
    });

    fancyIt()('can run the original function', async () => {
        // begin
        mocked(readOptions).mockImplementation(mockReadOptions);
        const clientMock = mocked(useElasticsearchClient).mockImplementation(
            getMockElasticsearchClient
        );
        const fakeOriginalFunction = jest.fn();
        const args = ['argument'];
        const flags = {
            text: 'text',
            number: 123,
            option_file: `${process.cwd()}/src/__mocks__/testsData/test_config/json/config.json`
        };
        const fakeCommand = getFakeCommand({
            id: 'foo:bar',
            parse: jest.fn().mockReturnValue({ flags, args })
        });
        const fakeDescriptor = {
            value: fakeOriginalFunction
        };
        await migrateLock()(fakeCommand, '', fakeDescriptor);

        // when
        await fakeDescriptor.value.call(fakeCommand);

        // then
        expect(readOptions).toHaveBeenCalledTimes(1);
        // @ts-ignore
        expect(clientMock.mock.results[0].value.exists).toHaveBeenCalledTimes(1);
        // @ts-ignore
        expect(clientMock.mock.results[0].value.createIndex).toHaveBeenCalledTimes(1);
        // @ts-ignore
        expect(clientMock.mock.results[0].value.postDocument).toHaveBeenCalledTimes(1);
        // @ts-ignore
        expect(clientMock.mock.results[0].value.close).toHaveBeenCalledTimes(1);
        expect(fakeOriginalFunction).toHaveBeenCalledTimes(1);
        // @ts-ignore
        expect(clientMock.mock.results[1].value.deleteDocument).toHaveBeenCalledTimes(1);
        // @ts-ignore
        expect(clientMock.mock.results[1].value.close).toHaveBeenCalledTimes(1);
    });
});
