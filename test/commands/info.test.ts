import { expect, test } from '@oclif/test';

describe('info command test', () => {
    test.stdout()
        .command(['info'])
        .it('runs info', (ctx) => {
            expect(ctx.stdout).to.contain('');
        });
});
