const test = {
    elasticsearch: {
        searchEngine: 'elasticsearch',
        version: '6',
        connect: { host: 'http://0.0.0.0:9202' }
    },
    migration: {
        location: 'migration',
        baselineVersions: {
            test_index1: 'v1.0.0',
            test_index2: 'v1.0.0'
        }
    }
};
export default test;
