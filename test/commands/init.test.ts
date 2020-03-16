import { expect, test } from '@oclif/test';
import * as EsUtils from '../../src/utils/es/EsUtils';
import MockElasticsearchClient from '../mock/MockElasticsearchClient';
import { clusterStatus } from '../../src/model/types';
import * as sinon from 'sinon';
import { cli } from 'cli-ux';

describe('Setup elasticsearch index migrate env test', () => {
    test.stub(EsUtils, 'default', () => new MockElasticsearchClient())
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
                    return Promise.resolve({ status: clusterStatus.YELLOW });
                }
            })()
    )
        .stub(cli, 'warn', sinon.stub())
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
                    return Promise.resolve({ status: clusterStatus.RED });
                }
            })()
    )
        .stub(cli, 'error', sinon.stub())
        .stdout()
        .command(['init'])
        .exit(1)
        .it('runs init cluster Status red ', () => {
            const error: any = cli.error;
            expect(error.called).is.true;
            expect(error.calledWith('cluster status is red.')).is.true;
        });
});
