import { test } from '@oclif/test';
import { mocked } from 'jest-mock';
import useElasticsearchClient from '../../../client/es/ElasticsearchClient';
import { getMockElasticsearchClient } from '../../../../__mocks__/client/es/mockElasticsearchClient';
import migrationBaselineVersionService from '../../../service/migrationBaselineVersionService';
import { getMockMigrationBaselineVersionService } from '../../../../__mocks__/searvice/mockMigrationBaselineVersionService';

jest.mock('../../../client/es/ElasticsearchClient');
jest.mock('../../../decorators/createMigrationIndex');
jest.mock('../../../decorators/migrateLock');
jest.mock('../../../service/migrationBaselineVersionService');

describe('baseline:esindex', () => {
    describe('resolve pattern', () => {
        beforeEach(() => {
            mocked(migrationBaselineVersionService).mockImplementation(
                getMockMigrationBaselineVersionService
            );
            mocked(useElasticsearchClient).mockImplementation(getMockElasticsearchClient);
        });
        afterEach(() => {
            mocked(migrationBaselineVersionService).mockClear();
            mocked(useElasticsearchClient).mockClear();
        });

        test.env({
            ELASTICSEARCH_MIGRATION_BASELINE_VERSION: 'v1.0.0',
            ELASTICSEARCH_VERSION: '7.0.0',
            ELASTICSEARCH_HOST: 'http://localhost:9202'
        })
            .stdout()
            .stderr()
            .command([
                'baseline',
                'test1',
                '-O',
                `${process.cwd()}/src/__mocks__/testsData/test_config/json/config.json`
            ])
            .it('can create a baseline', () => {
                expect(migrationBaselineVersionService).toHaveBeenCalledTimes(1);
            });
    });

    describe('reject pattern', () => {
        beforeEach(() => {
            mocked(migrationBaselineVersionService).mockImplementation(() => {
                return {
                    makeBaseline: () => Promise.reject('reject makeBaseline')
                };
            });
            mocked(useElasticsearchClient).mockImplementation(getMockElasticsearchClient);
        });
        afterEach(() => {
            mocked(migrationBaselineVersionService).mockClear();
            mocked(useElasticsearchClient).mockClear();
        });
        test.env({
            ELASTICSEARCH_MIGRATION_BASELINE_VERSION: 'v1.0.0',
            ELASTICSEARCH_VERSION: '7.0.0',
            ELASTICSEARCH_HOST: 'http://localhost:9202'
        })
            .stdout()
            .stderr()
            .command([
                'baseline',
                'test1',
                '-O',
                `${process.cwd()}/src/__mocks__/testsData/test_config/json/config.json`
            ])
            .catch(/throw error. caused by: reject makeBaseline/)
            .it('can not create a baseline');
    });
});
