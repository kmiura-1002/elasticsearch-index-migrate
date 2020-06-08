import { expect, test } from '@oclif/test';
import * as sinon from 'sinon';
import { cli } from 'cli-ux';
import * as executor from '../../src/executor/clean/CleanExecutor';

describe('clean command test', () => {
    test.stub(cli, 'info', sinon.stub())
        .stub(cli, 'confirm', () => async () => false)
        .env({
            ELASTICSEARCH_MIGRATION_LOCATIONS: `${process.cwd()}/test/data/migration`,
            ELASTICSEARCH_MIGRATION_BASELINE_VERSION: 'v1.0.0',
            ELASTICSEARCH_VERSION: '7',
            ELASTICSEARCH_HOST: 'http://localhost:9202'
        })
        .stdout()
        .command(['clean', '-i', 'test1'])
        .exit()
        .it('Interruption of processing', () => {
            const info = cli.info as sinon.SinonStub;
            expect(info.calledWith('Aborting the process.')).is.true;
            expect(info.calledWith('Start delete data.')).is.false;
        });

    test.stub(cli, 'info', sinon.stub())
        .stub(cli, 'confirm', () => async () => true)
        .stub(executor, 'cleanExecutor', sinon.stub().returns(Promise.resolve('success')))
        .env({
            ELASTICSEARCH_MIGRATION_LOCATIONS: `${process.cwd()}/test/data/migration`,
            ELASTICSEARCH_MIGRATION_BASELINE_VERSION: 'v1.0.0',
            ELASTICSEARCH_VERSION: '7',
            ELASTICSEARCH_HOST: 'http://localhost:9202'
        })
        .stdout()
        .command(['clean', '-i', 'test1'])
        .it('migration_history must be cleared(ES7)', () => {
            const info = cli.info as sinon.SinonStub;
            expect(info.calledWith('Delete test1 index history from migration history.')).is.true;
            expect(info.calledWith('Start delete data.')).is.true;

            const cleanExecutor = executor.cleanExecutor as sinon.SinonStub;
            expect(cleanExecutor.returned(Promise.resolve('success'))).is.true;
        });

    test.stub(cli, 'info', sinon.stub())
        .stub(cli, 'error', sinon.stub())
        .stub(cli, 'confirm', () => async () => true)
        .stub(executor, 'cleanExecutor', sinon.stub().returns(Promise.reject(new Error('reject'))))
        .env({
            ELASTICSEARCH_MIGRATION_LOCATIONS: `${process.cwd()}/test/data/migration`,
            ELASTICSEARCH_MIGRATION_BASELINE_VERSION: 'v1.0.0',
            ELASTICSEARCH_VERSION: '7',
            ELASTICSEARCH_HOST: 'http://localhost:9202'
        })
        .stdout()
        .command(['clean', '-i', 'test1'])
        .it('output an error when a deletion fails', () => {
            const info = cli.info as sinon.SinonStub;
            expect(info.calledWith('Delete test1 index history from migration history.')).is.true;
            expect(info.calledWith('Start delete data.')).is.true;

            const cleanExecutor = executor.cleanExecutor as sinon.SinonStub;
            expect(cleanExecutor.returned(Promise.reject('reject'))).is.true;

            const error = (cli.error as unknown) as sinon.SinonStub;
            expect(error.called).is.true;
            expect(error.calledWith('An error occurred during the deletion process : {}')).is.true;
        });

    // TODO DELETE
    test.stub(cli, 'warn', sinon.stub())
        .env({
            ELASTICSEARCH_MIGRATION_LOCATIONS: `${process.cwd()}/test/data/migration`,
            ELASTICSEARCH_MIGRATION_BASELINE_VERSION: 'v1.0.0',
            ELASTICSEARCH_VERSION: '7',
            ELASTICSEARCH_HOST: 'http://localhost:9202'
        })
        .stdout()
        .command(['clean', '-i', 'test1', '-t', 'index'])
        .exit()
        .it('Unimplemented options should not be processed (target=index)', () => {
            const warn = cli.warn as sinon.SinonStub;
            expect(warn.calledWith('Not implemented. Aborting the process.')).is.true;
        });

    // TODO DELETE
    test.stub(cli, 'warn', sinon.stub())
        .env({
            ELASTICSEARCH_MIGRATION_LOCATIONS: `${process.cwd()}/test/data/migration`,
            ELASTICSEARCH_MIGRATION_BASELINE_VERSION: 'v1.0.0',
            ELASTICSEARCH_VERSION: '7',
            ELASTICSEARCH_HOST: 'http://localhost:9202'
        })
        .stdout()
        .command(['clean', '-i', 'test1', '-t', 'all'])
        .exit()
        .it('Unimplemented options should not be processed (target=all)', () => {
            const warn = cli.warn as sinon.SinonStub;
            expect(warn.calledWith('Not implemented. Aborting the process.')).is.true;
        });
});
