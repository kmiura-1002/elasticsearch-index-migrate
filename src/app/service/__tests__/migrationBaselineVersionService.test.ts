import migrationBaselineVersionService from '../migrationBaselineVersionService';
import * as Config from '@oclif/config';
import { mocked } from 'jest-mock';
import { readOptions } from '../../flags/flagsLoader';
import useElasticsearchClient from '../../client/es/ElasticsearchClient';
import { mockReadOptions } from '../../../__mocks__/flags/mockReadOptions';
import { getMockElasticsearchClient } from '../../../__mocks__/client/es/mockElasticsearchClient';
import { cli } from 'cli-ux';

jest.mock('../../flags/flagsLoader');
jest.mock('../../client/es/ElasticsearchClient');
const spyInfo = jest.spyOn(cli, 'info');

describe('migrationBaselineVersionService', () => {
    beforeEach(() => {
        mocked(readOptions).mockClear();
        mocked(useElasticsearchClient).mockClear();
        mocked(spyInfo).mockClear();
    });

    it('can create a baseline.', async () => {
        mocked(readOptions).mockImplementation(mockReadOptions);
        mocked(useElasticsearchClient).mockImplementation(getMockElasticsearchClient);
        const parser = jest.fn().mockImplementationOnce(() => ({
            flags: {
                index: 'test_index',
                description: ''
            }
        }));

        const { makeBaseline } = await migrationBaselineVersionService(
            parser,
            {} as Config.IConfig
        );
        await makeBaseline();

        expect(spyInfo).toHaveBeenCalledTimes(3);
        expect(spyInfo.mock.calls[0][0]).toEqual('Baseline history does not exist.');
        expect(spyInfo.mock.calls[1][0]).toEqual('Create baseline in 1.0.0.');
        expect(spyInfo.mock.calls[2][0]).toEqual('Successfully created a baseline in 1.0.0.');
    });
});
