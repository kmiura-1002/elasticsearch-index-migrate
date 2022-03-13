import { loadMigrationScriptFile } from '../fileService';

describe('fileService', () => {
    it('can load migration files', () => {
        const migrationData = loadMigrationScriptFile('test1', [
            `${process.cwd()}/src/__mocks__/testsData/migration`
        ]);
        expect(migrationData).toEqual([
            {
                checksum: '9c87ddef4af2e9cb652eb0381f11177fd1dbaf53',
                file: {
                    description: 'description v1.0.0 add field',
                    migrate_script: {
                        properties: {
                            num: {
                                type: 'long'
                            }
                        }
                    },
                    type: 'ADD_FIELD'
                },
                physicalLocation: {
                    base: 'test1.json',
                    dir: `${process.cwd()}/src/__mocks__/testsData/migration/indices/test1`,
                    ext: '.json',
                    name: 'test1',
                    root: '/'
                },
                version: undefined
            },
            {
                checksum: '9c87ddef4af2e9cb652eb0381f11177fd1dbaf53',
                file: {
                    description: 'description v1.0.0 add field',
                    migrate_script: {
                        properties: {
                            num: {
                                type: 'long'
                            }
                        }
                    },
                    type: 'ADD_FIELD'
                },
                physicalLocation: {
                    base: 'v1.0.0__test1.json',
                    dir: `${process.cwd()}/src/__mocks__/testsData/migration/indices/test1`,
                    ext: '.json',
                    name: 'v1.0.0__test1',
                    root: '/'
                },
                version: 'v1.0.0'
            },
            {
                checksum: 'faf8e1174cd4ca66757a0a3c8bc26a6f839b56a3',
                file: {
                    description: 'description v1.0.1 add field',
                    migrate_script: {
                        properties: {
                            keyword: {
                                type: 'keyword'
                            }
                        }
                    },
                    type: 'ADD_FIELD'
                },
                physicalLocation: {
                    base: 'v1.0.1__test1.yaml',
                    dir: `${process.cwd()}/src/__mocks__/testsData/migration/indices/test1`,
                    ext: '.yaml',
                    name: 'v1.0.1__test1',
                    root: '/'
                },
                version: 'v1.0.1'
            }
        ]);
    });

    it('can load migration files when multiple locations are specified', () => {
        const migrationData = loadMigrationScriptFile('test1', [
            `${process.cwd()}/src/__mocks__/testsData/migration`,
            `${process.cwd()}/src/__mocks__/testsData/migration_2`
        ]);
        expect(migrationData).toEqual([
            {
                checksum: '9c87ddef4af2e9cb652eb0381f11177fd1dbaf53',
                file: {
                    description: 'description v1.0.0 add field',
                    migrate_script: {
                        properties: {
                            num: {
                                type: 'long'
                            }
                        }
                    },
                    type: 'ADD_FIELD'
                },
                physicalLocation: {
                    base: 'test1.json',
                    dir: `${process.cwd()}/src/__mocks__/testsData/migration/indices/test1`,
                    ext: '.json',
                    name: 'test1',
                    root: '/'
                },
                version: undefined
            },
            {
                checksum: '9c87ddef4af2e9cb652eb0381f11177fd1dbaf53',
                file: {
                    description: 'description v1.0.0 add field',
                    migrate_script: {
                        properties: {
                            num: {
                                type: 'long'
                            }
                        }
                    },
                    type: 'ADD_FIELD'
                },
                physicalLocation: {
                    base: 'v1.0.0__test1.json',
                    dir: `${process.cwd()}/src/__mocks__/testsData/migration/indices/test1`,
                    ext: '.json',
                    name: 'v1.0.0__test1',
                    root: '/'
                },
                version: 'v1.0.0'
            },
            {
                checksum: 'faf8e1174cd4ca66757a0a3c8bc26a6f839b56a3',
                file: {
                    description: 'description v1.0.1 add field',
                    migrate_script: {
                        properties: {
                            keyword: {
                                type: 'keyword'
                            }
                        }
                    },
                    type: 'ADD_FIELD'
                },
                physicalLocation: {
                    base: 'v1.0.1__test1.yaml',
                    dir: `${process.cwd()}/src/__mocks__/testsData/migration/indices/test1`,
                    ext: '.yaml',
                    name: 'v1.0.1__test1',
                    root: '/'
                },
                version: 'v1.0.1'
            },
            {
                checksum: '06b9f018d5c5c29b6c20619319aa84b2465bb763',
                file: {
                    description: 'test index',
                    migrate_script: {
                        mappings: {
                            properties: {
                                name: {
                                    type: 'text'
                                }
                            }
                        },
                        settings: {
                            index: {
                                number_of_replicas: 0,
                                number_of_shards: 1,
                                refresh_interval: '1s'
                            }
                        }
                    },
                    type: 'CREATE_INDEX'
                },
                physicalLocation: {
                    base: 'v1.0.0__create_index.json',
                    dir: `${process.cwd()}/src/__mocks__/testsData/migration_2/indices/test1`,
                    ext: '.json',
                    name: 'v1.0.0__create_index',
                    root: '/'
                },
                version: 'v1.0.0'
            },
            {
                checksum: '17dec9398479acc7f12247f6a51750b073996b7e',
                file: {
                    description: 'test index2',
                    migrate_script: {
                        mappings: {
                            properties: {
                                name: {
                                    type: 'text'
                                }
                            }
                        },
                        settings: {
                            index: {
                                number_of_replicas: 0,
                                number_of_shards: 1,
                                refresh_interval: '1s'
                            }
                        }
                    },
                    type: 'CREATE_INDEX'
                },
                physicalLocation: {
                    base: 'v2.0.0__create_index.json',
                    dir: `${process.cwd()}/src/__mocks__/testsData/migration_2/test1`,
                    ext: '.json',
                    name: 'v2.0.0__create_index',
                    root: '/'
                },
                version: 'v2.0.0'
            }
        ]);
    });

    it('can not load migration files', () => {
        const migrationData = loadMigrationScriptFile('unknown', [
            `${process.cwd()}/src/__mocks__/testsData/migration`
        ]);
        expect(migrationData).toEqual([]);
    });
});
