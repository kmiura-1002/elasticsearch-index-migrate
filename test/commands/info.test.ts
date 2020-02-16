import { expect, test } from '@oclif/test';

describe('info command test', () => {
    test.stdout()
        .command(['info', '-i', 'test'])
        .exit(404)
        .it('Migration file not found.');

    test.stdout()
        .command(['info', '-i', 'test1'])
        .it('info test', (ctx) => {
            expect(ctx.stdout).to.contain(
                'Version Description Type      Installedon State   \n' +
                    'v1.0.0  description ADD_FIELD             PENDING '
            );
        });

    test.stdout()
        .command(['info', '-i', 'test2-2020.01.01'])
        .it('info versiond index test', (ctx) => {
            expect(ctx.stdout).to.contain(
                'Version Description Type      Installedon State   \n' +
                    'v1.0.0  description ADD_FIELD             PENDING '
            );
        });

    test.stdout()
        .command(['info', '-i', 'test2_2020.01.01'])
        .it('info other versiond index test', (ctx) => {
            expect(ctx.stdout).to.contain(
                'Version Description Type      Installedon State   \n' +
                    'v1.0.0  description ADD_FIELD             PENDING '
            );
        });
});
