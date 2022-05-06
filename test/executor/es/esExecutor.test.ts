import 'mocha';
import { expect } from 'chai';
import * as sinon from 'sinon';
import MockElasticsearchClient from '../../mock/MockElasticsearchClient';
import { esExecutor, ExecutorFnc } from '../../../src/executor/es/esExecutor';
import { MigrationTypes, ResolvedMigration } from '../../../src/model/types';
import { ApiResponse as ApiResponse6 } from 'es6';
import { ApiResponse as ApiResponse7 } from 'es7';

describe('esExecutor test', () => {
    const indexName = 'index_name';
    let sandbox: sinon.SinonSandbox;
    before(() => {
        sandbox = sinon.createSandbox();
    });
    afterEach(() => {
        sandbox.restore();
    });
    it('The ability to putMapping', async () => {
        const client = new MockElasticsearchClient();
        const stub = sandbox
            .stub(client, 'putMapping')
            .returns(Promise.resolve({ statusCode: 200 } as ApiResponse6 | ApiResponse7));
        const executor = esExecutor.get(MigrationTypes.ADD_FIELD) as ExecutorFnc;
        const param: ResolvedMigration = {
            type: MigrationTypes.ADD_FIELD,
            version: 'v1.0.0',
            physicalLocation: {
                base: 'base',
                dir: 'dir',
                ext: 'ext',
                name: 'name',
                root: 'root'
            },
            migrate_script: {
                properties: {
                    no: {
                        type: 'long'
                    }
                }
            },
            query_parameters: {
                include_type_name: true
            }
        };
        const ret = await executor(indexName, client, param);
        expect(ret).to.deep.eq({ statusCode: 200 });
        expect(stub.calledOnce).is.true;
        expect(
            stub.calledWith({
                index: indexName,
                body: param.migrate_script,
                ...param.query_parameters
            })
        ).is.true;
    });

    it('The ability to createIndex', async () => {
        const client = new MockElasticsearchClient();
        const stub = sandbox
            .stub(client, 'createIndex')
            .returns(Promise.resolve({ statusCode: 200 } as ApiResponse6 | ApiResponse7));
        const executor = esExecutor.get(MigrationTypes.CREATE_INDEX) as ExecutorFnc;
        const param: ResolvedMigration = {
            type: MigrationTypes.CREATE_INDEX,
            version: 'v1.0.0',
            physicalLocation: {
                base: 'base',
                dir: 'dir',
                ext: 'ext',
                name: 'name',
                root: 'root'
            },
            migrate_script: {
                mappings: {
                    properties: {
                        no: {
                            type: 'long'
                        }
                    }
                }
            },
            query_parameters: {
                include_type_name: true
            }
        };

        const ret = await executor(indexName, client, param);
        expect(ret).to.deep.eq({ statusCode: 200 });
        expect(stub.calledOnce).is.true;
        expect(
            stub.calledWith({
                index: indexName,
                body: param.migrate_script,
                ...param.query_parameters
            })
        ).is.true;
    });

    it('The ability to deleteIndex', async () => {
        const client = new MockElasticsearchClient();
        const stub = sandbox
            .stub(client, 'delete')
            .returns(Promise.resolve({ statusCode: 200 } as ApiResponse6<any, any>));
        const executor = esExecutor.get(MigrationTypes.DELETE_INDEX) as ExecutorFnc;
        const param: ResolvedMigration = {
            type: MigrationTypes.DELETE_INDEX,
            version: 'v1.0.0',
            physicalLocation: {
                base: 'base',
                dir: 'dir',
                ext: 'ext',
                name: 'name',
                root: 'root'
            },
            query_parameters: {
                include_type_name: true
            }
        };
        const ret = await executor(indexName, client, param);
        expect(ret).to.deep.eq({ statusCode: 200 });
        expect(stub.calledOnce).is.true;
        expect(
            stub.calledWith({
                index: indexName,
                ...param.query_parameters
            })
        ).is.true;
    });

    it('The ability to alterSetting', async () => {
        const client = new MockElasticsearchClient();
        const stub = sandbox
            .stub(client)
            .putSetting.returns(Promise.resolve({ statusCode: 200 } as ApiResponse6<any, any>));
        const executor = esExecutor.get(MigrationTypes.ALTER_SETTING) as ExecutorFnc;
        const param: ResolvedMigration = {
            type: MigrationTypes.ALTER_SETTING,
            version: 'v1.0.0',
            physicalLocation: {
                base: 'base',
                dir: 'dir',
                ext: 'ext',
                name: 'name',
                root: 'root'
            },
            migrate_script: {
                index: {
                    number_of_replicas: 1
                }
            },
            query_parameters: {
                include_type_name: true
            }
        };
        const ret = await executor(indexName, client, param);
        expect(ret).to.deep.eq({ statusCode: 200 });
        expect(stub.calledOnce).is.true;
        expect(
            stub.calledWith({
                index: indexName,
                body: param.migrate_script,
                ...param.query_parameters
            })
        ).is.true;
    });

    it('The ability to createDocument', async () => {
        const client = new MockElasticsearchClient();
        const stub = sandbox
            .stub(client)
            .postDocument.returns(Promise.resolve({ statusCode: 200 } as ApiResponse6<any, any>));
        const executor = esExecutor.get(MigrationTypes.CREATE_DOCUMENT) as ExecutorFnc;
        const param: ResolvedMigration = {
            type: MigrationTypes.ALTER_SETTING,
            version: 'v1.0.0',
            physicalLocation: {
                base: 'base',
                dir: 'dir',
                ext: 'ext',
                name: 'name',
                root: 'root'
            },
            data: {
                id: '123',
                name: 'testing',
            }
        };
        const ret = await executor(indexName, client, param);
        expect(ret).to.deep.eq({ statusCode: 200 });
        expect(stub.calledOnce).is.true;
        expect(
            stub.calledWith({
                id: '123',
                body: param.data,
                index: indexName,
                ...param.query_parameters
            })
        ).is.true;
    });


    [
        {
            type: MigrationTypes.ALTER_SETTING,
            version: 'v1.0.0',
            physicalLocation: {
                base: 'base',
                dir: 'dir',
                ext: 'ext',
                name: 'name',
                root: 'root'
            },
            data: {}
        },
        {
            type: MigrationTypes.ALTER_SETTING,
            version: 'v1.0.0',
            physicalLocation: {
                base: 'base',
                dir: 'dir',
                ext: 'ext',
                name: 'name',
                root: 'root'
            },
            data: [{}]
        },
        {
            type: MigrationTypes.ALTER_SETTING,
            version: 'v1.0.0',
            physicalLocation: {
                base: 'base',
                dir: 'dir',
                ext: 'ext',
                name: 'name',
                root: 'root'
            },
        },
    ].forEach((param: ResolvedMigration) => {
        it('Data validation in createDocument', async () => {
            const client = new MockElasticsearchClient();
            const stub = sandbox
                .stub(client)
                .postDocument.returns(Promise.resolve({ statusCode: 200 } as ApiResponse6<any, any>));
            const executor = esExecutor.get(MigrationTypes.CREATE_DOCUMENT) as ExecutorFnc;
    
            try {
                const ret = await executor(indexName, client, param);
                expect(ret).not.to.deep.eq({ statusCode: 200 });
            } catch (error) {
                expect(error).to.have.property('error');
            }
        });
    });
});
