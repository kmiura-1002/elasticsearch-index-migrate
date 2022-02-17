import migrationBaselineVersionService from '../migrationBaselineVersionService';
import * as Config from '@oclif/config';
import { mocked } from 'jest-mock';
import { readOptions } from '../../flags/flagsLoader';
import useElasticsearchClient from '../../client/es/ElasticsearchClient';
import { mockReadOptions } from '../../../__mocks__/flags/mockReadOptions';
import { getMockElasticsearchClient } from '../../../__mocks__/client/es/mockElasticsearchClient';
import { cli } from 'cli-ux';
import { IndicesExists as IndicesExists6 } from 'es6/api/requestParams';
import { IndicesExists as IndicesExists7 } from 'es7/api/requestParams';

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

        const { makeBaseline } = migrationBaselineVersionService(
            {
                index: 'test_index',
                description: ''
            },
            {} as Config.IConfig
        );
        await makeBaseline();

        expect(spyInfo).toHaveBeenCalledTimes(3);
        expect(spyInfo.mock.calls[0][0]).toEqual('Baseline history does not exist.');
        expect(spyInfo.mock.calls[1][0]).toEqual('Create baseline in 1.0.0.');
        expect(spyInfo.mock.calls[2][0]).toEqual('Successfully created a baseline in 1.0.0.');
    });

    it('can not create a baseline.', async () => {
        mocked(readOptions).mockImplementation(mockReadOptions);
        mocked(useElasticsearchClient).mockImplementation(() => {
            return {
                ...getMockElasticsearchClient(),
                search(_param: IndicesExists6 | IndicesExists7) {
                    // Just make length>1 with appropriate value.
                    return Promise.resolve([{}]);
                }
            };
        });
        const parser = jest.fn().mockImplementationOnce(() => ({
            flags: {
                index: 'test_index',
                description: ''
            }
        }));

        const { makeBaseline } = migrationBaselineVersionService(parser, {} as Config.IConfig);
        await makeBaseline();

        expect(spyInfo).toHaveBeenCalledTimes(1);
        expect(spyInfo.mock.calls[0][0]).toEqual('There is already a baseline history');
    });
});
