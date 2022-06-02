module.exports = {
    roots: ['<rootDir>/src'],
    preset: 'ts-jest',
    testEnvironment: 'node',
    verbose: true,
    collectCoverage: true,
    coveragePathIgnorePatterns: ['/node_modules/', '/src_old/', '/test/', '/test_old/'],
    clearMocks: true,
    testTimeout: 60e3,
    testMatch: [
        '<rootDir>/src/**/__tests__/**/*.{js,ts}',
        '<rootDir>/src/**/*.{spec,test,it}.{js,ts}'
    ],
    moduleFileExtensions: ["js", "mjs", "cjs", "jsx", "ts", "tsx", "json", "node", "jsm"],
    // Added to resolve error:'ENOENT: no such file or directory'
    moduleNameMapper: {
        'es6/lib/(.*)':'<rootDir>/node_modules/es6/lib/$1',
        'es7/lib/(.*)':'<rootDir>/node_modules/es7/lib/$1'
    }
};
