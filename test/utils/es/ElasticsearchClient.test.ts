import {
    convertGetMappingResponse,
    isIndex6,
    isIndex7,
    isIndicesExists6,
    isIndicesPutMapping6,
    isSearch6
} from '../../../src/utils/es/ElasticsearchClient';
import {
    IndicesExists as IndicesExists6,
    IndicesPutMapping as IndicesPutMapping6,
    IndicesPutSettings as IndicesPutSettings6,
    Search as Search6,
    Index as Index6,
    IndicesGetMapping as IndicesGetMapping6
} from 'es6/api/requestParams';
import {
    IndicesExists as IndicesExists7,
    IndicesPutMapping as IndicesPutMapping7,
    IndicesPutSettings as IndicesPutSettings7,
    Search as Search7,
    Index as Index7
} from 'es7/api/requestParams';
import { expect } from 'chai';
import { ApiResponse as ApiResponse6 } from 'es6/lib/Transport';

type IndicesExistsTestType = {
    param: IndicesExists6 | IndicesExists7;
    expected: boolean;
};

type IndicesPutMappingTestType = {
    param: IndicesPutMapping6 | IndicesPutMapping7;
    expected: boolean;
};

type IndicesPutSettingsTestType = {
    param: IndicesPutSettings6 | IndicesPutSettings7;
    expected: boolean;
};

type SearchTestType = {
    param: Search6 | Search7;
    expected: boolean;
};

type IndexTestType = {
    param: Index6 | Index7;
    expected: boolean;
};

describe('ElasticsearchClient', () => {
    const indicesExistsTestData: IndicesExistsTestType[] = [
        {
            param: {
                index: 'index',
                expand_wildcards: 'open'
            },
            expected: true
        },
        {
            param: {
                index: 'index',
                expand_wildcards: 'closed'
            },
            expected: true
        },
        {
            param: {
                index: 'index',
                expand_wildcards: 'none'
            },
            expected: true
        },
        {
            param: {
                index: 'index',
                expand_wildcards: 'all'
            },
            expected: true
        },
        {
            param: {
                index: 'index',
                expand_wildcards: 'hidden'
            },
            expected: false
        },
        {
            param: {
                index: 'index',
                expand_wildcards: undefined
            },
            expected: true
        }
    ];
    indicesExistsTestData.forEach((testData) => {
        it(`isIndicesExists6 fnc return ${testData.expected} when param is ${JSON.stringify(
            testData.param
        )}`, () => {
            expect(isIndicesExists6(testData.param)).is.eq(testData.expected);
        });
    });

    const indicesPutMappingTestData: IndicesPutMappingTestType[] = [
        {
            param: {
                body: {},
                expand_wildcards: 'open'
            },
            expected: true
        },
        {
            param: {
                body: {},
                expand_wildcards: 'closed'
            },
            expected: true
        },
        {
            param: {
                body: {},
                expand_wildcards: 'none'
            },
            expected: true
        },
        {
            param: {
                body: {},
                expand_wildcards: 'all'
            },
            expected: true
        },
        {
            param: {
                body: {},
                expand_wildcards: 'hidden'
            },
            expected: false
        },
        {
            param: {
                body: {}
            },
            expected: true
        },
        {
            param: {
                body: {},
                type: 'aaa'
            },
            expected: true
        }
    ];
    indicesPutMappingTestData.forEach((testData) => {
        it(`isIndicesPutMapping6 fnc return ${testData.expected} when param is ${JSON.stringify(
            testData.param
        )}`, () => {
            expect(isIndicesPutMapping6(testData.param)).is.eq(testData.expected);
        });
    });

    const searchTestData: SearchTestType[] = [
        {
            param: {
                body: {},
                expand_wildcards: 'open'
            },
            expected: true
        },
        {
            param: {
                body: {},
                expand_wildcards: 'closed'
            },
            expected: true
        },
        {
            param: {
                body: {},
                expand_wildcards: 'none'
            },
            expected: true
        },
        {
            param: {
                body: {},
                expand_wildcards: 'all'
            },
            expected: true
        },
        {
            param: {
                body: {},
                expand_wildcards: 'hidden'
            },
            expected: false
        },
        {
            param: {
                body: {}
            },
            expected: true
        },
        {
            param: {
                body: {},
                expand_wildcards: undefined,
                ccs_minimize_roundtrips: true
            },
            expected: false
        },
        {
            param: {
                body: {},
                expand_wildcards: undefined,
                ccs_minimize_roundtrips: false
            },
            expected: false
        }
    ];
    searchTestData.forEach((testData) => {
        it(`isSearch6 fnc return ${testData.expected} when param is ${JSON.stringify(
            testData.param
        )}`, () => {
            expect(isSearch6(testData.param)).is.eq(testData.expected);
        });
    });

    const IndicesPutSettingsTestData: IndicesPutSettingsTestType[] = [
        {
            param: {
                body: {},
                expand_wildcards: 'open'
            },
            expected: true
        },
        {
            param: {
                body: {},
                expand_wildcards: 'closed'
            },
            expected: true
        },
        {
            param: {
                body: {},
                expand_wildcards: 'none'
            },
            expected: true
        },
        {
            param: {
                body: {},
                expand_wildcards: 'all'
            },
            expected: true
        },
        {
            param: {
                body: {},
                expand_wildcards: 'hidden'
            },
            expected: false
        },
        {
            param: {
                body: {}
            },
            expected: true
        }
    ];
    IndicesPutSettingsTestData.forEach((testData) => {
        it(`isIndicesPutSettings6 fnc return ${testData.expected} when param is ${JSON.stringify(
            testData.param
        )}`, () => {
            expect(isSearch6(testData.param)).is.eq(testData.expected);
        });
    });

    const Index6TestData: IndexTestType[] = [
        {
            param: {
                index: 'index',
                type: 'type',
                body: {},
                parent: 'parent'
            },
            expected: true
        },
        {
            param: {
                index: 'index',
                body: {}
            },
            expected: false
        },
        {
            param: {
                index: 'index',
                type: 'type',
                body: {},
                refresh: true
            },
            expected: false
        },
        {
            param: {
                index: 'index',
                type: 'type',
                body: {}
            },
            expected: true
        },
        {
            param: {
                index: 'index',
                type: 'type',
                body: {},
                version_type: 'external'
            },
            expected: true
        },
        {
            param: {
                index: 'index',
                type: 'type',
                body: {},
                version_type: 'external_gte'
            },
            expected: true
        },
        {
            param: {
                index: 'index',
                type: 'type',
                body: {},
                version_type: 'force'
            },
            expected: true
        },
        {
            param: {
                index: 'index',
                type: 'type',
                body: {},
                version_type: 'internal'
            },
            expected: true
        }
    ];
    Index6TestData.forEach((testData) => {
        it(`isIndex6 fnc return ${testData.expected} when param is ${JSON.stringify(
            testData.param
        )}`, () => {
            expect(isIndex6(testData.param)).is.eq(testData.expected);
        });
    });

    const Index7TestData: IndexTestType[] = [
        {
            param: {
                index: 'index',
                type: 'type',
                body: {},
                parent: 'parent'
            },
            expected: false
        },
        {
            param: {
                index: 'index',
                body: {}
            },
            expected: true
        },
        {
            param: {
                index: 'index',
                type: 'type',
                body: {},
                refresh: true
            },
            expected: true
        },
        {
            param: {
                index: 'index',
                type: 'type',
                body: {},
                refresh: 'true'
            },
            expected: true
        },
        {
            param: {
                index: 'index',
                type: 'type',
                body: {}
            },
            expected: true
        },
        {
            param: {
                index: 'index',
                type: 'type',
                body: {},
                version_type: 'external'
            },
            expected: true
        },
        {
            param: {
                index: 'index',
                type: 'type',
                body: {},
                version_type: 'external_gte'
            },
            expected: true
        },
        {
            param: {
                index: 'index',
                type: 'type',
                body: {},
                version_type: 'force'
            },
            expected: false
        },
        {
            param: {
                index: 'index',
                type: 'type',
                body: {},
                version_type: 'internal'
            },
            expected: true
        }
    ];
    Index7TestData.forEach((testData) => {
        it(`isIndex7 fnc return ${testData.expected} when param is ${JSON.stringify(
            testData.param
        )}`, () => {
            expect(isIndex7(testData.param)).is.eq(testData.expected);
        });
    });

    it('convertGetMappingResponse return json array with param.index is undefined', () => {
        const expected = {
            test: 'abc'
        };
        const param: IndicesGetMapping6 = {};
        const res: ApiResponse6 = {
            body: expected,
            headers: {},
            meta: {} as any,
            statusCode: 200,
            warnings: null
        };
        const actual = convertGetMappingResponse(param, res);
        expect(actual).is.an('array').lengthOf(1);
        expect(actual[0]).is.eq(expected);
    });

    it('convertGetMappingResponse return json array with param.index is array', () => {
        const expected = [
            {
                a: 'abc'
            },
            {
                b: 'def'
            }
        ];
        const param: IndicesGetMapping6 = {
            index: ['test1', 'test2']
        };
        const res: ApiResponse6 = {
            body: { test1: { a: 'abc' }, test2: { b: 'def' } },
            headers: {},
            meta: {} as any,
            statusCode: 200,
            warnings: null
        };
        const actual = convertGetMappingResponse(param, res);
        expect(actual).is.an('array').lengthOf(2);
        expect(actual).is.deep.eq(expected);
    });

    it('convertGetMappingResponse return json array with param.index is string type', () => {
        const expected = [
            {
                a: 'abc'
            }
        ];
        const param: IndicesGetMapping6 = {
            index: ['test1']
        };
        const res: ApiResponse6 = {
            body: { test1: { a: 'abc' } },
            headers: {},
            meta: {} as any,
            statusCode: 200,
            warnings: null
        };
        const actual = convertGetMappingResponse(param, res);
        expect(actual).is.an('array').lengthOf(1);
        expect(actual).is.deep.eq(expected);
    });
});
