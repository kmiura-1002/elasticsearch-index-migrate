import { expect, test } from '@oclif/test';
import * as EsUtils from '../../src/utils/es/EsUtils';
import MockElasticsearchClient from '../mock/MockElasticsearchClient';
import * as sinon from 'sinon';
import { cli } from 'cli-ux';
import { ClusterStatuses } from '../../src/model/types';

describe('Setup elasticsearch index migrate env test', () => {
    test.stub(EsUtils, 'default', () => new MockElasticsearchClient())
        .env({
            ELASTICSEARCH_MIGRATION_LOCATIONS: `${process.cwd()}/test/data/migration`,
            ELASTICSEARCH_MIGRATION_BASELINE_VERSION: 'v1.0.0',
            ELASTICSEARCH_VERSION: '7',
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
        .stub(cli, 'warn', sinon.stub())
        .env({
            ELASTICSEARCH_MIGRATION_LOCATIONS: `${process.cwd()}/test/data/migration`,
            ELASTICSEARCH_MIGRATION_BASELINE_VERSION: 'v1.0.0',
            ELASTICSEARCH_VERSION: '7',
            ELASTICSEARCH_HOST: 'http://localhost:9202'
        })
        .stdout()
        .command(['init'])
        .it('runs init cluster Status yellow ', (ctx) => {
            const warn = cli.warn as sinon.SinonStub;
            expect(warn.called).is.true;
            expect(warn.calledWith('cluster status is yellow.')).is.true;
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
                    return Promise.resolve({ status: ClusterStatuses.RED });
                }
            })()
    )
        .stub(cli, 'error', sinon.stub())
        .env({
            ELASTICSEARCH_MIGRATION_LOCATIONS: `${process.cwd()}/test/data/migration`,
            ELASTICSEARCH_MIGRATION_BASELINE_VERSION: 'v1.0.0',
            ELASTICSEARCH_VERSION: '7',
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
                exists(index: string) {
                    return Promise.resolve(true);
                }
            })()
    )
        .stub(cli, 'log', sinon.stub())
        .env({
            ELASTICSEARCH_MIGRATION_LOCATIONS: `${process.cwd()}/test/data/migration`,
            ELASTICSEARCH_MIGRATION_BASELINE_VERSION: 'v1.0.0',
            ELASTICSEARCH_VERSION: '7',
            ELASTICSEARCH_HOST: 'http://localhost:9202'
        })
        .stdout()
        .command(['init'])
        .exit(1)
        .it('migrate_history index already exists', () => {
            const log = cli.log as sinon.SinonStub;
            expect(log.calledTwice).is.true;
            expect(log.calledWith('Start creating index for migrate.')).is.true;
            expect(log.calledWith('migrate_history index already exists.')).is.true;
        });

    test.stub(
        EsUtils,
        'default',
        () =>
            new (class extends MockElasticsearchClient {
                createIndex(index: string, body?: any) {
                    return Promise.resolve({ statusCode: 400 });
                }
                exists(index: string) {
                    return Promise.resolve(false);
                }
            })()
    )
        .stub(cli, 'error', sinon.stub())
        .env({
            ELASTICSEARCH_MIGRATION_LOCATIONS: `${process.cwd()}/test/data/migration`,
            ELASTICSEARCH_MIGRATION_BASELINE_VERSION: 'v1.0.0',
            ELASTICSEARCH_VERSION: '7',
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
                createIndex(index: string, body?: any) {
                    return Promise.reject();
                }
                exists(index: string) {
                    return Promise.resolve(false);
                }
            })()
    )
        .stub(cli, 'error', sinon.stub())
        .env({
            ELASTICSEARCH_MIGRATION_LOCATIONS: `${process.cwd()}/test/data/migration`,
            ELASTICSEARCH_MIGRATION_BASELINE_VERSION: 'v1.0.0',
            ELASTICSEARCH_VERSION: '7',
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
});
