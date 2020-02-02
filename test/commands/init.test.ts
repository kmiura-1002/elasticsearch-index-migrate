import { expect, test } from '@oclif/test';

describe('Setup elasticsearch index migrate env test', () => {
    test.stdout()
        .command(['init'])
        .it('runs init', (ctx) => {
            expect(ctx.stdout).to.contain(
                'Start creating index for migrate.\n' + 'Finish creating index for migrate.\n'
            );
        });
});
