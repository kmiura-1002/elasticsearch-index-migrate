import { expect, test } from '@oclif/test';
import * as EsUtils from '../../src/utils/es/EsUtils';
import MockElasticsearchClient from '../mock/MockElasticsearchClient';
import * as sinon from 'sinon';
import { cli } from 'cli-ux';
import { ClusterStatuses } from '../../src/model/types';
import * as types from '../../src/model/types';
import { es6ClientContainer, es7ClientContainer } from '../utils/ioc-test';
import ElasticsearchClient from '../../src/utils/es/ElasticsearchClient';
import { Bindings } from '../../src/ioc.bindings';
import {
    IndicesCreate as IndicesCreate6,
    IndicesExists as IndicesExists6
} from 'es6/api/requestParams';
import {
    IndicesCreate as IndicesCreate7,
    IndicesExists as IndicesExists7
} from 'es7/api/requestParams';

describe('Setup elasticsearch index migrate env test', () => {
    after(async () => {
        const client7 = es7ClientContainer().get<ElasticsearchClient>(Bindings.ElasticsearchClient);
        await client7.delete({ index: 'test*' });

        const client6 = es6ClientContainer().get<ElasticsearchClient>(Bindings.ElasticsearchClient);
        await client6.delete({ index: 'test*' });
    });

    test.stub(EsUtils, 'default', () => new MockElasticsearchClient())
        .env({
            ELASTICSEARCH_MIGRATION_LOCATIONS: `${process.cwd()}/test/data/migration`,
            ELASTICSEARCH_MIGRATION_BASELINE_VERSION: 'v1.0.0',
            ELASTICSEARCH_VERSION: '7.0.0',
            ELASTICSEARCH_HOST: 'http://localhost:9202'
        })
        .stdout()
        .command(['init'])
        .it('runs init', (ctx) => {
            expect(ctx.stdout).to.contain(
                'Start creating index for migrate.\n' + 'Finish creating index for migrate.\n'
            );
        });

    test.stub(
        EsUtils,
        'default',
        () =>
            new (class extends MockElasticsearchClient {
                healthCheck(): Promise<{ status: string }> {
                    return Promise.resolve({ status: ClusterStatuses.YELLOW });
                }
            })()
    )
        .stub(cli, 'info', sinon.stub())
        .env({
            ELASTICSEARCH_MIGRATION_LOCATIONS: `${process.cwd()}/test/data/migration`,
            ELASTICSEARCH_MIGRATION_BASELINE_VERSION: 'v1.0.0',
            ELASTICSEARCH_VERSION: '7.0.0',
            ELASTICSEARCH_HOST: 'http://localhost:9202'
        })
        .stdout()
        .command(['init'])
        .it('runs init cluster Status yellow ', () => {
            const info = cli.info as sinon.SinonStub;
            expect(info.called).is.true;
            expect(info.calledWith('cluster status is yellow.')).is.true;
            expect(info.calledWith('Start creating index for migrate.')).is.true;
            expect(info.calledWith('Finish creating index for migrate.')).is.true;
        });

    test.stub(
        EsUtils,
        'default',
        () =>
            new (class extends MockElasticsearchClient {
                healthCheck(): Promise<{ status: string }> {
                    return Promise.resolve({ status: ClusterStatuses.RED });
                }
            })()
    )
        .stub(cli, 'error', sinon.stub())
        .env({
            ELASTICSEARCH_MIGRATION_LOCATIONS: `${process.cwd()}/test/data/migration`,
            ELASTICSEARCH_MIGRATION_BASELINE_VERSION: 'v1.0.0',
            ELASTICSEARCH_VERSION: '7.0.0',
            ELASTICSEARCH_HOST: 'http://localhost:9202'
        })
        .stdout()
        .command(['init'])
        .exit(1)
        .it('runs init cluster Status red ', () => {
            const error = (cli.error as unknown) as sinon.SinonStub;
            expect(error.called).is.true;
            expect(error.calledWith('cluster status is red.')).is.true;
        });

    test.stub(
        EsUtils,
        'default',
        () =>
            new (class extends MockElasticsearchClient {
                exists(_param: IndicesExists6 | IndicesExists7) {
                    return Promise.resolve(true);
                }
                healthCheck(): Promise<{ status: string }> {
                    return Promise.resolve({ status: ClusterStatuses.GREEN });
                }
            })()
    )
        .stub(cli, 'info', sinon.stub())
        .env({
            ELASTICSEARCH_MIGRATION_LOCATIONS: `${process.cwd()}/test/data/migration`,
            ELASTICSEARCH_MIGRATION_BASELINE_VERSION: 'v1.0.0',
            ELASTICSEARCH_VERSION: '7.0.0',
            ELASTICSEARCH_HOST: 'http://localhost:9202'
        })
        .stdout()
        .command(['init'])
        .exit(1)
        .it('migrate_history index already exists', () => {
            const info = cli.info as sinon.SinonStub;
            expect(info.calledTwice).is.true;
            expect(info.calledWith('Start creating index for migrate.')).is.true;
            expect(info.calledWith('migrate_history index already exists.')).is.true;
        });

    test.stub(
        EsUtils,
        'default',
        () =>
            new (class extends MockElasticsearchClient {
                createIndex(_param: IndicesCreate6 | IndicesCreate7) {
                    return Promise.resolve({ statusCode: 400 });
                }
                exists(_param: IndicesExists6 | IndicesExists7) {
                    return Promise.resolve(false);
                }
            })()
    )
        .stub(cli, 'error', sinon.stub())
        .env({
            ELASTICSEARCH_MIGRATION_LOCATIONS: `${process.cwd()}/test/data/migration`,
            ELASTICSEARCH_MIGRATION_BASELINE_VERSION: 'v1.0.0',
            ELASTICSEARCH_VERSION: '7.0.0',
            ELASTICSEARCH_HOST: 'http://localhost:9202'
        })
        .stdout()
        .command(['init'])
        .exit(1)
        .it('Failed to create index for migrate.', () => {
            const error = (cli.error as unknown) as sinon.SinonStub;
            expect(error.calledOnce).is.true;
            expect(error.calledWith('Failed to create index for migrate.')).is.true;
        });

    test.stub(
        EsUtils,
        'default',
        () =>
            new (class extends MockElasticsearchClient {
                createIndex(_param: IndicesCreate6 | IndicesCreate7) {
                    return Promise.reject();
                }
                exists(_param: IndicesExists6 | IndicesExists7) {
                    return Promise.resolve(false);
                }
            })()
    )
        .stub(cli, 'error', sinon.stub())
        .env({
            ELASTICSEARCH_MIGRATION_LOCATIONS: `${process.cwd()}/test/data/migration`,
            ELASTICSEARCH_MIGRATION_BASELINE_VERSION: 'v1.0.0',
            ELASTICSEARCH_VERSION: '7.0.0',
            ELASTICSEARCH_HOST: 'http://localhost:9202'
        })
        .stdout()
        .command(['init'])
        .exit(1)
        .it('Failed to create index', () => {
            const error = (cli.error as unknown) as sinon.SinonStub;
            expect(error.calledOnce).is.true;
            expect(error.calledWith('Failed to create index: undefined')).is.true;
        });

    test.stub(types, 'MAPPING_HISTORY_INDEX_NAME', 'test_migrate_history')
        .stub(cli, 'info', sinon.stub())
        .env({
            ELASTICSEARCH_MIGRATION_LOCATIONS: `${process.cwd()}/test/data/migration`,
            ELASTICSEARCH_MIGRATION_BASELINE_VERSION: 'v1.0.0',
            ELASTICSEARCH_VERSION: '7.6.2',
            ELASTICSEARCH_HOST: 'http://localhost:9202'
        })
        .stdout()
        .command(['init'])
        .it('command must be able to build the environment in version 7', async () => {
            const info = cli.info as sinon.SinonStub;
            expect(info.calledWith('Start creating index for migrate.')).is.true;
            expect(info.calledWith('Finish creating index for migrate.')).is.true;
        });

    test.stub(types, 'MAPPING_HISTORY_INDEX_NAME', 'test_migrate_history')
        .stub(cli, 'info', sinon.stub().returns(cli.info))
        .env({
            ELASTICSEARCH_MIGRATION_LOCATIONS: `${process.cwd()}/test/data/migration`,
            ELASTICSEARCH_MIGRATION_BASELINE_VERSION: 'v1.0.0',
            ELASTICSEARCH_VERSION: '6.8.8',
            ELASTICSEARCH_HOST: 'http://localhost:9201'
        })
        .stdout()
        .command(['init'])
        .it('command must be able to build the environment in version 6', async () => {
            const info = cli.info as sinon.SinonStub;
            expect(info.calledWith('Start creating index for migrate.')).is.true;
            expect(info.calledWith('Finish creating index for migrate.')).is.true;
        });

    test.stub(types, 'MAPPING_HISTORY_INDEX_NAME', 'test_migrate_history')
        .stub(cli, 'error', sinon.stub().returns(cli.error))
        .env({
            ELASTICSEARCH_MIGRATION_LOCATIONS: `${process.cwd()}/test/data/migration`,
            ELASTICSEARCH_MIGRATION_BASELINE_VERSION: 'v1.0.0',
            ELASTICSEARCH_VERSION: '0.0.0',
            ELASTICSEARCH_HOST: 'http://localhost:9201'
        })
        .stdout()
        .command(['init'])
        .catch((err) =>
            expect(err.message).to.eq('0.0.0 is unsupported. support version is 6.x or 7.x.')
        )
        .it('unsupported support version');
});
