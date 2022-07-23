import { createMigrationHistory } from '../createMigrationHistory';
import { fancyIt } from '../../../__mocks__/fancyIt';
import { getFakeCommand } from '../../../__mocks__/command/fakeCommand';
import {
    mockReadOptionsWithHistoryIndexRequestBody,
    mockToolConfigRepository
} from '../../../__mocks__/context/config_domain/mockReadOptions';
import {
    IndicesCreate as IndicesCreate6,
    IndicesExists as IndicesExists6
} from 'es6/api/requestParams';
import {
    IndicesCreate as IndicesCreate7,
    IndicesExists as IndicesExists7
} from 'es7/api/requestParams';
import { ApiResponse as ApiResponse6 } from 'es6/lib/Transport';
import { ApiResponse as ApiResponse7 } from 'es7/lib/Transport';
import { mocked } from 'jest-mock';
import { useElasticsearchClient } from '../../client/es/ElasticsearchClient';
import { getMockElasticsearchClient } from '../../../__mocks__/client/es/mockElasticsearchClient';
import { CliUx } from '@oclif/core';
import { toolConfigRepository } from '../../context/config_domain/toolConfigRepository';
import { ToolConfigSpecProps } from '../../context/config_domain/spec';
import { ToolConfigEntity } from '../../context/config_domain/toolConfigEntity';

jest.mock('../../context/config_domain/toolConfigRepository');
jest.mock('../../client/es/ElasticsearchClient');
const spyError = jest.spyOn(CliUx.ux, 'error');

describe('createMigrationHistory', () => {
    beforeEach(() => {
        mocked(toolConfigRepository).mockClear();
        mocked(useElasticsearchClient).mockClear();
        mocked(spyError).mockClear();
    });

    fancyIt()('can run the original function', async () => {
        // begin
        mocked(toolConfigRepository).mockImplementation(mockToolConfigRepository);
        mocked(useElasticsearchClient).mockImplementation(getMockElasticsearchClient);
        const fakeOriginalFunction = jest.fn();
        const args = ['argument'];
        const flags = {
            text: 'text',
            number: 123
        };
        const fakeCommand = getFakeCommand({
            id: 'foo:bar',
            parse: jest.fn().mockReturnValue({ flags, args })
        });
        const fakeDescriptor = {
            value: fakeOriginalFunction
        };
        await createMigrationHistory()(fakeCommand, '', fakeDescriptor);

        // when
        await fakeDescriptor.value.call(fakeCommand);

        // then
        expect(toolConfigRepository).toHaveBeenCalledTimes(1);
        expect(useElasticsearchClient).toHaveBeenCalledTimes(1);
        expect(fakeOriginalFunction).toHaveBeenCalledTimes(1);
    });

    fancyIt()(
        'can not run the original function when connection error in elasticsearch',
        async () => {
            // begin
            mocked(toolConfigRepository).mockImplementation(mockToolConfigRepository);
            mocked(useElasticsearchClient).mockImplementation(() => {
                return {
                    ...getMockElasticsearchClient(),
                    exists(_param: IndicesExists6 | IndicesExists7) {
                        return Promise.reject('exists error');
                    }
                };
            });
            const fakeOriginalFunction = jest.fn();
            const args = ['argument'];
            const flags = {
                text: 'text',
                number: 123
            };
            const fakeCommand = getFakeCommand({
                id: 'foo:bar',
                parse: jest.fn().mockReturnValue({ flags, args })
            });
            const fakeDescriptor = {
                value: fakeOriginalFunction
            };
            await createMigrationHistory()(fakeCommand, '', fakeDescriptor);

            // when
            const actual = fakeDescriptor.value.call(fakeCommand);

            // then
            await expect(actual).rejects.toThrow();
            expect(toolConfigRepository).toHaveBeenCalledTimes(1);
            expect(useElasticsearchClient).toHaveBeenCalledTimes(1);
            expect(spyError).toHaveBeenCalledTimes(1);
            expect(spyError.mock.calls[0][0]).toEqual(
                'Initialization process failed.\nreason:["exists error"]'
            );
        }
    );
    fancyIt()(
        'can not run the original function when the index creation fails due to internal server error',
        async () => {
            // begin
            mocked(toolConfigRepository).mockImplementation(mockToolConfigRepository);
            mocked(useElasticsearchClient).mockImplementation(() => {
                return {
                    ...getMockElasticsearchClient(),
                    createIndex(_param: IndicesCreate6 | IndicesCreate7) {
                        return Promise.reject({ statusCode: 500 } as ApiResponse6 | ApiResponse7);
                    },
                    exists(_param: IndicesExists6 | IndicesExists7) {
                        return Promise.resolve(false);
                    }
                };
            });
            const fakeOriginalFunction = jest.fn();
            const args = ['argument'];
            const flags = {
                text: 'text',
                number: 123
            };
            const fakeCommand = getFakeCommand({
                id: 'foo:bar',
                parse: jest.fn().mockReturnValue({ flags, args })
            });
            const fakeDescriptor = {
                value: fakeOriginalFunction
            };
            await createMigrationHistory()(fakeCommand, '', fakeDescriptor);

            // when
            const actual = fakeDescriptor.value.call(fakeCommand);

            // then
            await expect(actual).rejects.toThrow();
            expect(toolConfigRepository).toHaveBeenCalledTimes(1);
            expect(useElasticsearchClient).toHaveBeenCalledTimes(1);
            expect(spyError).toHaveBeenCalledTimes(1);
            expect(spyError.mock.calls[0][0]).toEqual(
                'Initialization process failed.\nreason:[{"statusCode":500}]'
            );
        }
    );

    fancyIt()('can not run the original function when the index creation fails', async () => {
        // begin
        mocked(toolConfigRepository).mockImplementation(mockToolConfigRepository);
        mocked(useElasticsearchClient).mockImplementation(() => {
            return {
                ...getMockElasticsearchClient(),
                createIndex(_param: IndicesCreate6 | IndicesCreate7) {
                    return Promise.resolve({ statusCode: 400 } as ApiResponse6 | ApiResponse7);
                },
                exists(_param: IndicesExists6 | IndicesExists7) {
                    return Promise.resolve(false);
                }
            };
        });
        const fakeOriginalFunction = jest.fn();
        const args = ['argument'];
        const flags = {
            text: 'text',
            number: 123
        };
        const fakeCommand = getFakeCommand({
            id: 'foo:bar',
            parse: jest.fn().mockReturnValue({ flags, args })
        });
        const fakeDescriptor = {
            value: fakeOriginalFunction
        };
        await createMigrationHistory()(fakeCommand, '', fakeDescriptor);

        // when
        const actual = fakeDescriptor.value.call(fakeCommand);

        // then
        await expect(actual).rejects.toThrow();
        expect(toolConfigRepository).toHaveBeenCalledTimes(1);
        expect(useElasticsearchClient).toHaveBeenCalledTimes(1);
        expect(spyError).toHaveBeenCalledTimes(2);
        expect(spyError.mock.calls[0][0]).toEqual('Failed to create history index.');
        expect(spyError.mock.calls[1][0]).toEqual(
            'Initialization process failed.\n' + 'reason:[Error: Failed to create history index.]'
        );
    });

    fancyIt()(
        'can run the original function when historyIndexRequestBody is specified',
        async () => {
            // begin
            mocked(toolConfigRepository).mockImplementation(() => {
                return {
                    ...mockToolConfigRepository(),
                    findBy(_spec: ToolConfigSpecProps) {
                        return ToolConfigEntity.readConfig(
                            mockReadOptionsWithHistoryIndexRequestBody
                        );
                    }
                };
            });
            mocked(useElasticsearchClient).mockImplementation(getMockElasticsearchClient);
            const fakeOriginalFunction = jest.fn();
            const args = ['argument'];
            const flags = {
                text: 'text',
                number: 123
            };
            const fakeCommand = getFakeCommand({
                id: 'foo:bar',
                parse: jest.fn().mockReturnValue({ flags, args })
            });
            const fakeDescriptor = {
                value: fakeOriginalFunction
            };
            await createMigrationHistory()(fakeCommand, '', fakeDescriptor);

            // when
            await fakeDescriptor.value.call(fakeCommand);

            // then
            expect(toolConfigRepository).toHaveBeenCalledTimes(1);
            expect(useElasticsearchClient).toHaveBeenCalledTimes(1);
            expect(fakeOriginalFunction).toHaveBeenCalledTimes(1);
        }
    );
});
