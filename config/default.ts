export default {
    elasticsearch: {
        version: '7.5.2',
        host: 'http://localhost:9202'
    },
    migration: {
        locations: ['migration', 'mapping'],
        baselineVersion: 'v1.0.0'
    }
};
