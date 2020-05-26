import { expect, test } from '@oclif/test';
import * as EsUtils from '../../src/utils/es/EsUtils';
import * as sinon from 'sinon';
import * as fileUtils from '../../src/utils/fileUtils';
import { findAllFiles, findFiles } from '../../src/utils/fileUtils';
import getElasticsearchClient from '../../src/utils/es/EsUtils';
import MockElasticsearchClient from '../mock/MockElasticsearchClient';
import * as fs from 'fs';
import { MigrationConfigType } from '../../src/model/types';
import * as path from 'path';
import * as util from '@oclif/config/lib/util';

describe('abstract command test', () => {
    const userHome = process.env[process.platform == 'win32' ? 'USERPROFILE' : 'HOME'] ?? '';
    const existsSyncCallback = sinon.stub();
    const utilCallback = sinon.stub();
    existsSyncCallback
        .callsFake(fs.existsSync)
        .withArgs(path.join(userHome, '.config/elasticsearch-index-migrate/config.json'))
        .returns(Promise.resolve(true));
    utilCallback
        .callsFake(util.loadJSON)
        .withArgs(path.join(userHome, '.config/elasticsearch-index-migrate/config.json'))
        .returns(
            Promise.resolve<MigrationConfigType>({
                elasticsearch: {
                    version: '6',
                    connect: { host: 'http://0.0.0.0:9202' }
                },
                migration: {
                    locations: ['test_location'],
                    baselineVersion: 'v1.0.0'
                }
            })
        );

    test.stub(EsUtils, 'default', sinon.stub().returns(new MockElasticsearchClient()))
        .stub(
            fileUtils,
            'findAllFiles',
            sinon.stub().callsFake((dir: string[]) => {
                const paths: string[] = [];
                dir.forEach((value) => {
                    findFiles(value, (data) => paths.push(data));
                });
                return paths;
            })
        )

        .env({
            ELASTICSEARCH_MIGRATION_LOCATIONS: `${process.cwd()}/test/data/migration`,
            ELASTICSEARCH_MIGRATION_BASELINE_VERSION:
                'test_ELASTICSEARCH_MIGRATION_BASELINE_VERSION',
            ELASTICSEARCH_VERSION: 'test_ELASTICSEARCH_VERSION',
            ELASTICSEARCH_HOST: 'http://0.0.0.0:9200/test_ELASTICSEARCH_HOST',
            ELASTICSEARCH_SSL: 'test_ELASTICSEARCH_SSL',
            ELASTICSEARCH_CLOUDID: 'test_ELASTICSEARCH_CLOUDID',
            ELASTICSEARCH_USERNAME: 'test_ELASTICSEARCH_USERNAME',
            ELASTICSEARCH_PASSWORD: 'test_ELASTICSEARCH_PASSWORD'
        })
        .stdout()
        .command(['plan', '-i', 'test1'])
        .it('read environment variables test', (ctx) => {
            const findAllFilesStub = findAllFiles as sinon.SinonStub;
            const esClientStub = getElasticsearchClient as sinon.SinonStub;
            expect(process.env.ELASTICSEARCH_MIGRATION_LOCATIONS).to.equal(
                `${process.cwd()}/test/data/migration`
            );
            expect(process.env.ELASTICSEARCH_MIGRATION_BASELINE_VERSION).to.equal(
                'test_ELASTICSEARCH_MIGRATION_BASELINE_VERSION'
            );
            expect(process.env.ELASTICSEARCH_VERSION).to.equal('test_ELASTICSEARCH_VERSION');
            expect(process.env.ELASTICSEARCH_HOST).to.equal(
                'http://0.0.0.0:9200/test_ELASTICSEARCH_HOST'
            );
            expect(process.env.ELASTICSEARCH_SSL).to.equal('test_ELASTICSEARCH_SSL');
            expect(process.env.ELASTICSEARCH_CLOUDID).to.equal('test_ELASTICSEARCH_CLOUDID');
            expect(process.env.ELASTICSEARCH_USERNAME).to.equal('test_ELASTICSEARCH_USERNAME');
            expect(process.env.ELASTICSEARCH_PASSWORD).to.equal('test_ELASTICSEARCH_PASSWORD');

            expect(findAllFilesStub.calledWith([`${process.cwd()}/test/data/migration`])).is.true;
            expect(
                esClientStub.calledWith({
                    version: 'test_ELASTICSEARCH_VERSION',
                    connect: {
                        host: 'http://0.0.0.0:9200/test_ELASTICSEARCH_HOST',
                        sslCa: 'test_ELASTICSEARCH_SSL',
                        cloudId: 'test_ELASTICSEARCH_CLOUDID',
                        username: 'test_ELASTICSEARCH_USERNAME',
                        password: 'test_ELASTICSEARCH_PASSWORD'
                    }
                })
            ).is.true;
            expect(ctx.stdout).to.contain(
                'Version Description Type      Installedon State   \n' +
                    'v1.0.0  description ADD_FIELD             PENDING \n'
            );
        });

    test.stub(EsUtils, 'default', sinon.stub().returns(new MockElasticsearchClient()))
        .stub(
            fileUtils,
            'findAllFiles',
            sinon.stub().callsFake((dir: string[]) => {
                const paths: string[] = [];
                dir.map((value) => `${process.cwd()}/test/data/${value}`).forEach((value) => {
                    findFiles(value, (data) => paths.push(data));
                });
                return paths;
            })
        )

        .stdout()
        .command([
            'plan',
            '-i',
            'test1',
            '--option_file',
            `${process.cwd()}/test/data/test.config.json`
        ])
        .it('read option_file test', (ctx) => {
            const findAllFilesStub = findAllFiles as sinon.SinonStub;
            const esClientStub = getElasticsearchClient as sinon.SinonStub;

            expect(findAllFilesStub.calledWith(['migration'])).is.true;
            expect(
                esClientStub.calledWith({
                    version: '6',
                    connect: {
                        host: 'http://0.0.0.0:9202'
                    }
                })
            ).is.true;
            expect(ctx.stdout).to.contain(
                'Version Description Type      Installedon State   \nv1.0.0  description ADD_FIELD             PENDING \n'
            );
        });

    test.stub(EsUtils, 'default', sinon.stub().returns(new MockElasticsearchClient()))
        .stub(
            fileUtils,
            'findAllFiles',
            sinon.stub().callsFake((dir: string[]) => {
                const paths: string[] = [];
                dir.map((value) => `${process.cwd()}/test/data/${value}`).forEach((value) => {
                    findFiles(value, (data) => paths.push(data));
                });
                return paths;
            })
        )
        .stdout()
        .command(['plan', '-i', 'test1'])
        .it('read default option test', (ctx) => {
            const findAllFilesStub = findAllFiles as sinon.SinonStub;
            const esClientStub = getElasticsearchClient as sinon.SinonStub;

            expect(findAllFilesStub.calledWith(['migration'])).is.true;
            expect(
                esClientStub.calledWith({
                    version: '7',
                    connect: {
                        host: 'http://localhost:9202'
                    }
                })
            ).is.true;
            expect(ctx.stdout).to.contain(
                'Version Description Type      Installedon State   \nv1.0.0  description ADD_FIELD             PENDING \n'
            );
        });

    test.stub(EsUtils, 'default', sinon.stub().returns(new MockElasticsearchClient()))
        .stub(fs, 'existsSync', existsSyncCallback)
        .stub(util, 'loadJSON', utilCallback)
        .stub(
            fileUtils,
            'findAllFiles',
            sinon
                .stub()
                .withArgs('test_location')
                .callsFake((dir: string[]) => {
                    const paths: string[] = [];
                    dir.map(() => `${process.cwd()}/test/data/migration`).forEach((value) => {
                        findFiles(value, (data) => paths.push(data));
                    });
                    return paths;
                })
        )
        .stdout()
        .command(['plan', '-i', 'test1'])
        .it('read default option test eeee', (ctx) => {
            const findAllFilesStub = findAllFiles as sinon.SinonStub;
            expect(findAllFilesStub.calledWith(['test_location'])).is.true;
            expect(ctx.stdout).to.contain(
                'Version Description Type      Installedon State   \nv1.0.0  description ADD_FIELD             PENDING \n'
            );
        });
});
