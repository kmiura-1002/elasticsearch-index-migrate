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
    ]
};
