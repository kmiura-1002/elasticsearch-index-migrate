import {
    isIndicesExists6,
    isIndicesPutMapping6,
    isSearch6
} from '../../../src/utils/es/ElasticsearchClient';
import {
    IndicesExists as IndicesExists6,
    IndicesPutMapping as IndicesPutMapping6,
    Search as Search6
} from 'es6/api/requestParams';
import {
    IndicesExists as IndicesExists7,
    IndicesPutMapping as IndicesPutMapping7,
    Search as Search7
} from 'es7/api/requestParams';
import { expect } from 'chai';

type IndicesExistsTestType = {
    param: IndicesExists6 | IndicesExists7;
    expected: boolean;
};

type IndicesPutMappingTestType = {
    param: IndicesPutMapping6 | IndicesPutMapping7;
    expected: boolean;
};

type SearchTestType = {
    param: Search6 | Search7;
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
            expected: false
        }
    ];
    indicesExistsTestData.forEach((testData) => {
        it(`isIndicesExists6 fnc return ${testData.expected} when expand_wildcards is ${testData.param.expand_wildcards}`, () => {
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
            expected: false
        }
    ];
    indicesPutMappingTestData.forEach((testData) => {
        it(`isIndicesPutMapping6 fnc return ${testData.expected} when expand_wildcards is ${testData.param.expand_wildcards}`, () => {
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
            expected: false
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
});
