import { expect, test } from '@oclif/test';
import * as EsUtils from '../../src/utils/es/EsUtils';
import MockElasticsearchClient from '../data/mock/MockElasticsearchClient';

describe('Setup elasticsearch index migrate env test', () => {
    test.stub(EsUtils, 'default', () => new MockElasticsearchClient())
        .stdout()
        .command(['init'])
        .it('runs init', (ctx) => {
            console.log(ctx.stdout);
            expect(ctx.stdout).to.contain(
                'Start creating index for migrate.\n' + 'Finish creating index for migrate.\n'
            );
        });
});
