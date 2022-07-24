import { test } from '@oclif/test';
import { mocked } from 'jest-mock';
import { useElasticsearchClient } from '../../../client/es/ElasticsearchClient';
import { getMockElasticsearchClient } from '../../../../__mocks__/client/es/mockElasticsearchClient';
import { migrationPlanService } from '../../../service/migrationPlanService';
import { getMockMigrationPlanService } from '../../../../__mocks__/searvice/mockMigrationPlanService';

jest.mock('../../../client/es/ElasticsearchClient');
jest.mock('../../../decorators/createMigrationHistory');
jest.mock('../../../decorators/migrateLock');
jest.mock('../../../service/migrationPlanService');

describe('validate', () => {
    describe('resolve pattern', () => {
        beforeEach(() => {
            mocked(migrationPlanService).mockImplementation(getMockMigrationPlanService);
            mocked(useElasticsearchClient).mockImplementation(getMockElasticsearchClient);
        });
        afterEach(() => {
            mocked(migrationPlanService).mockClear();
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
                'validate',
                'test_index1',
                '-O',
                `${process.cwd()}/src/__mocks__/testsData/test_config/json/config.json`
            ])
            .it('can validate the applied migration', () => {
                expect(migrationPlanService).toHaveBeenCalledTimes(1);
            });
    });

    describe('reject pattern', () => {
        beforeEach(() => {
            mocked(migrationPlanService).mockImplementation(() => {
                return {
                    refresh: () => Promise.reject('reject refresh'),
                    validate: () => Promise.reject('reject validate')
                };
            });
            mocked(useElasticsearchClient).mockImplementation(getMockElasticsearchClient);
        });
        afterEach(() => {
            mocked(migrationPlanService).mockClear();
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
                'validate',
                'test_index1',
                '-O',
                `${process.cwd()}/src/__mocks__/testsData/test_config/json/config.json`
            ])
            .catch(/throw error. caused by: reject validate/)
            .it('can not validate the applied migration');
    });
});
