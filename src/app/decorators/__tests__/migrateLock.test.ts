import { fancyIt } from '../../../__mocks__/fancyIt';
import { mocked } from 'jest-mock';
import { useElasticsearchClient } from '../../client/es/ElasticsearchClient';
import { getFakeCommand } from '../../../__mocks__/command/fakeCommand';
import { CliUx } from '@oclif/core';
import { migrateLock } from '../migrateLock';
import { mockToolConfigRepository } from '../../../__mocks__/context/config_domain/mockReadOptions';
import { getMockElasticsearchClient } from '../../../__mocks__/client/es/mockElasticsearchClient';
import type {
    DeleteByQuery as DeleteByQuery6,
    IndicesExists as IndicesExists6,
    Search as Search6
} from 'es6/api/requestParams';
import type {
    DeleteByQuery as DeleteByQuery7,
    IndicesExists as IndicesExists7,
    Search as Search7
} from 'es7/api/requestParams';
import type { LockIndex } from '../../types';
import { Document } from '../../client/es/types';
import { toolConfigRepository } from '../../context/config_domain/toolConfigRepository';

jest.mock('../../context/config_domain/toolConfigRepository');
jest.mock('../../client/es/ElasticsearchClient');
const spyError = jest.spyOn(CliUx.ux, 'error');
const spyDebug = jest.spyOn(CliUx.ux, 'debug');
const mockDate = new Date(2022, 0, 1, 1, 1, 1);

describe('migrateLock', () => {
    const fakeOriginalFunction = jest.fn();

    beforeEach(() => {
        mocked(toolConfigRepository).mockClear();
        mocked(useElasticsearchClient).mockClear();
        mocked(spyError).mockClear();
        mocked(spyDebug).mockClear();
        mocked(fakeOriginalFunction).mockClear();
    });

    fancyIt()('can run the original function', async () => {
        // begin
        mocked(toolConfigRepository).mockImplementation(mockToolConfigRepository);
        const clientMock = mocked(useElasticsearchClient).mockImplementation(() => {
            return {
                ...getMockElasticsearchClient(),
                exists: jest
                    .fn()
                    .mockImplementation(
                        (_param: IndicesExists6 | IndicesExists7): Promise<boolean> => {
                            return Promise.resolve(true);
                        }
                    )
            };
        });
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
        expect(toolConfigRepository).toHaveBeenCalledTimes(1);
        expect(fakeOriginalFunction).toHaveBeenCalledTimes(1);
        // @ts-ignore
        expect(clientMock.mock.results[0].value.exists).toHaveBeenCalledTimes(1);
        // @ts-ignore
        expect(clientMock.mock.results[0].value.postDocument).toHaveBeenCalledTimes(1);
        // @ts-ignore
        expect(clientMock.mock.results[0].value.close).toHaveBeenCalledTimes(1);
        // @ts-ignore
        expect(clientMock.mock.results[1].value.deleteDocument).toHaveBeenCalledTimes(1);
        // @ts-ignore
        expect(clientMock.mock.results[1].value.close).toHaveBeenCalledTimes(1);
    });

    fancyIt()('can run the original function when the command fails', async () => {
        // begin
        mocked(toolConfigRepository).mockImplementation(mockToolConfigRepository);
        const clientMock = mocked(useElasticsearchClient).mockImplementation(() => {
            return {
                ...getMockElasticsearchClient(),
                exists: jest
                    .fn()
                    .mockImplementation(
                        (_param: IndicesExists6 | IndicesExists7): Promise<boolean> => {
                            return Promise.resolve(true);
                        }
                    )
            };
        });
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
            value: fakeOriginalFunction.mockRejectedValueOnce('fake commands will fail')
        };
        await migrateLock()(fakeCommand, '', fakeDescriptor);

        // when
        await fakeDescriptor.value.call(fakeCommand);

        // then
        expect(spyDebug.mock.calls[0][0]).toEqual(
            'An error occurred in the command. reason:[fake commands will fail]'
        );
        expect(toolConfigRepository).toHaveBeenCalledTimes(1);
        expect(fakeOriginalFunction).toHaveBeenCalledTimes(1);
        // @ts-ignore
        expect(clientMock.mock.results[0].value.exists).toHaveBeenCalledTimes(1);
        // @ts-ignore
        expect(clientMock.mock.results[0].value.postDocument).toHaveBeenCalledTimes(1);
        // @ts-ignore
        expect(clientMock.mock.results[0].value.close).toHaveBeenCalledTimes(1);
        // @ts-ignore
        expect(clientMock.mock.results[1].value.deleteDocument).toHaveBeenCalledTimes(1);
        // @ts-ignore
        expect(clientMock.mock.results[1].value.close).toHaveBeenCalledTimes(1);
    });

    fancyIt()('can not run the original function when it is locked', async () => {
        // begin
        jest.useFakeTimers();
        jest.setSystemTime(mockDate);
        mocked(toolConfigRepository).mockImplementation(mockToolConfigRepository);

        const clientMock = mocked(useElasticsearchClient).mockImplementation(() => {
            return {
                ...getMockElasticsearchClient(),
                exists: jest
                    .fn()
                    .mockImplementation(
                        (_param: IndicesExists6 | IndicesExists7): Promise<boolean> => {
                            return Promise.resolve(true);
                        }
                    ),
                search: jest
                    .fn()
                    .mockImplementationOnce(
                        (param: Search6 | Search7): Promise<Document<LockIndex>[]> => {
                            return Promise.resolve([
                                {
                                    _index: '',
                                    _type: '',
                                    _id: '',
                                    _source: {
                                        command: 'test',
                                        create: new Date()
                                    }
                                }
                            ]);
                        }
                    )
                    .mockImplementation(
                        <R>(param: Search6 | Search7): Promise<R[]> => Promise.resolve([])
                    )
            };
        });
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

        // when, then
        await expect(fakeDescriptor.value.call(fakeCommand)).rejects.toThrowError(
            new Error(`Lock creation failed.
reason:[Error: Migration is being done by other processes(lock command:test, lock time:2022-01-01T01:01:01.000+09:00).
If the previous process failed and you are left with a lock, remove all documents from the migrate_lock index.]`)
        );

        expect(toolConfigRepository).toHaveBeenCalledTimes(1);
        expect(fakeOriginalFunction).toHaveBeenCalledTimes(0);
        // @ts-ignore
        expect(clientMock.mock.results[0].value.exists).toHaveBeenCalledTimes(1);
        // @ts-ignore
        expect(clientMock.mock.results[0].value.search).toHaveBeenCalledTimes(1);
        // @ts-ignore
        expect(clientMock.mock.results[0].value.postDocument).toHaveBeenCalledTimes(0);
        // @ts-ignore
        expect(clientMock.mock.results[0].value.close).toHaveBeenCalledTimes(1);
    });

    fancyIt()('can not run the original function when lock index does not exist', async () => {
        // begin
        mocked(toolConfigRepository).mockImplementation(mockToolConfigRepository);

        const clientMock = mocked(useElasticsearchClient).mockImplementation(
            getMockElasticsearchClient
        );
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

        // when, then
        await expect(fakeDescriptor.value.call(fakeCommand)).rejects.toThrowError(
            new Error(`Lock creation failed.
reason:[Error: Cannot create a lock because the index does not exist.]`)
        );

        expect(toolConfigRepository).toHaveBeenCalledTimes(1);
        expect(fakeOriginalFunction).toHaveBeenCalledTimes(0);
        // @ts-ignore
        expect(clientMock.mock.results[0].value.exists).toHaveBeenCalledTimes(1);
    });

    fancyIt()('can not unlock when the unlock fails', async () => {
        // begin
        mocked(toolConfigRepository).mockImplementation(mockToolConfigRepository);
        const clientMock = mocked(useElasticsearchClient).mockImplementation(() => {
            return {
                ...getMockElasticsearchClient(),
                deleteDocument: jest
                    .fn()
                    .mockImplementation(
                        (_param: DeleteByQuery6 | DeleteByQuery7): Promise<any> =>
                            Promise.reject('Failed to delete document')
                    ),
                exists: jest
                    .fn()
                    .mockImplementation(
                        (_param: IndicesExists6 | IndicesExists7): Promise<boolean> => {
                            return Promise.resolve(true);
                        }
                    )
            };
        });
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

        // when, then
        await expect(fakeDescriptor.value.call(fakeCommand)).rejects.toThrowError(
            new Error(`Unlock failed. Please unlock migrate_lock manually.
reason:[Failed to delete document]`)
        );

        expect(toolConfigRepository).toHaveBeenCalledTimes(1);
        expect(fakeOriginalFunction).toHaveBeenCalledTimes(1);
        // @ts-ignore
        expect(clientMock.mock.results[0].value.exists).toHaveBeenCalledTimes(1);
        // @ts-ignore
        expect(clientMock.mock.results[0].value.postDocument).toHaveBeenCalledTimes(1);
        // @ts-ignore
        expect(clientMock.mock.results[0].value.close).toHaveBeenCalledTimes(1);
        // @ts-ignore
        expect(clientMock.mock.results[1].value.deleteDocument).toHaveBeenCalledTimes(1);
        // @ts-ignore
        expect(clientMock.mock.results[1].value.close).toHaveBeenCalledTimes(0);
    });
});
