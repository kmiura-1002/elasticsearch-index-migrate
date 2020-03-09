import { expect, test } from '@oclif/test';
import * as MigrationExecutor from '../../src/executor/migration/MigrationExecutor';

describe('Migrates Elasticsearch index to the latest version.', () => {
    test.stub(MigrationExecutor, 'migrate', () => Promise.resolve(1))
        .stdout()
        .command(['migrate', '-i', 'test1'])
        .it('runs migrate', (ctx) => {
            expect(ctx.stdout).to.contain('Migration completed. (count: 1)');
        });

    test.stub(MigrationExecutor, 'migrate', () => Promise.resolve(undefined))
        .stdout()
        .command(['migrate', '-i', 'test1'])
        .exit(500)
        .it('Migration failed.');

    test.stdout()
        .command(['migrate', '-i', 'not_fount'])
        .exit(404)
        .it('Error: Migration file not found.');
});
