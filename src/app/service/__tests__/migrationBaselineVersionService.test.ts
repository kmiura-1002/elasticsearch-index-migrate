import { migrationBaselineVersionService } from '../migrationBaselineVersionService';
import { mocked } from 'jest-mock';
import { useElasticsearchClient } from '../../client/es/ElasticsearchClient';
import { getMockElasticsearchClient } from '../../../__mocks__/client/es/mockElasticsearchClient';
import { IndicesExists as IndicesExists6 } from 'es6/api/requestParams';
import { IndicesExists as IndicesExists7 } from 'es7/api/requestParams';
import { CliUx } from '@oclif/core';
import type { MigrationConfig } from '../../types';
import { MigrationTypes } from '../../types';
import { SettingNotFoundError } from '../../context/error/SettingNotFoundError';

jest.mock('../../client/es/ElasticsearchClient');
const spyInfo = jest.spyOn(CliUx.ux, 'info');

describe('migrationBaselineVersionService', () => {
    beforeEach(() => {
        mocked(useElasticsearchClient).mockClear();
        mocked(spyInfo).mockClear();
    });

    it('can create a baseline.', async () => {
        mocked(useElasticsearchClient).mockImplementation(getMockElasticsearchClient);
        const baseline = 'v1.0.0';
        const config = {
            elasticsearch: {
                searchEngine: 'elasticsearch',
                version: '7',
                connect: {
                    host: ''
                }
            },
            migration: {
                location: '',
                baselineVersions: {
                    test_index: baseline
                }
            }
        } as Required<MigrationConfig>;

        const { makeBaseline } = migrationBaselineVersionService('test_index', '', config);
        await makeBaseline();

        expect(spyInfo).toHaveBeenCalledTimes(3);
        expect(spyInfo.mock.calls[0][0]).toEqual('Baseline history does not exist.');
        expect(spyInfo.mock.calls[1][0]).toEqual(`Create baseline in ${baseline}.`);
        expect(spyInfo.mock.calls[2][0]).toEqual(`Successfully created a baseline in ${baseline}.`);
    });

    it('can create a baseline when the target is specified in args.', async () => {
        mocked(useElasticsearchClient).mockImplementation(getMockElasticsearchClient);
        const baseline = 'v1.0.0';
        const config = {
            elasticsearch: {
                searchEngine: 'elasticsearch',
                version: '7',
                connect: {
                    host: ''
                }
            },
            migration: {
                location: '',
                baselineVersions: {
                    test_index: baseline
                }
            }
        } as Required<MigrationConfig>;

        const { makeBaseline } = migrationBaselineVersionService('test_index', '', config);
        await makeBaseline();

        expect(spyInfo).toHaveBeenCalledTimes(3);
        expect(spyInfo.mock.calls[0][0]).toEqual('Baseline history does not exist.');
        expect(spyInfo.mock.calls[1][0]).toEqual(`Create baseline in ${baseline}.`);
        expect(spyInfo.mock.calls[2][0]).toEqual(`Successfully created a baseline in ${baseline}.`);
    });

    it('can not create a baseline when a baseline already exists.', async () => {
        mocked(useElasticsearchClient).mockImplementation(() => {
            return {
                ...getMockElasticsearchClient(),
                search(_param: IndicesExists6 | IndicesExists7) {
                    // Just make length>1 with appropriate value.
                    return Promise.resolve([
                        {
                            _index: '',
                            _type: '',
                            _id: '',
                            _source: {
                                script_name: 'v1.0.0__add_fieldcopy.json',
                                migrate_version: 'v1.0.0',
                                description: 'book index',
                                execution_time: 1,
                                index_name: 'test',
                                installed_on: "2020-01-01'T'00:00:00",
                                script_type: MigrationTypes.ADD_FIELD,
                                success: false,
                                checksum: undefined
                            }
                        }
                    ]);
                }
            };
        });
        const config = {
            elasticsearch: {
                searchEngine: 'elasticsearch',
                version: '7',
                connect: {
                    host: ''
                }
            },
            migration: {
                location: '',
                baselineVersions: {
                    test_index: 'v1.0.0'
                }
            }
        } as Required<MigrationConfig>;

        const { makeBaseline } = migrationBaselineVersionService('test_index', '', config);
        await makeBaseline();

        expect(spyInfo).toHaveBeenCalledTimes(1);
        expect(spyInfo.mock.calls[0][0]).toEqual('There is already a baseline history');
    });

    // it('can not create a baseline when the target is unspecified.', async () => {
    //     mocked(readOptions).mockImplementation(mockReadOptions);
    //
    //     const { makeBaseline } = migrationBaselineVersionService({}, {} as Config.Config);
    //
    //     await expect(makeBaseline()).rejects.toThrowError(
    //         new Error('Migration target is unknown.')
    //     );
    // });

    it('can not create a baseline when baseline config does not exist.', async () => {
        mocked(useElasticsearchClient).mockImplementation(getMockElasticsearchClient);
        const config = {
            elasticsearch: {
                searchEngine: 'elasticsearch',
                version: '7',
                connect: {
                    host: ''
                }
            },
            migration: {
                location: '',
                baselineVersions: {
                    test_index: '1.0.0'
                }
            }
        } as Required<MigrationConfig>;
        const { makeBaseline } = migrationBaselineVersionService('test', '', config);
        const actual = makeBaseline();
        await expect(actual).rejects.toThrow(SettingNotFoundError);
        await expect(actual).rejects.toThrowError(
            new Error(`The baseline setting for index(test) does not exist.`)
        );
    });
});
