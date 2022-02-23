import { Flags } from '@oclif/core';

export const esConnectionFlags = {
    search_engine: Flags.string({
        required: false,
        env: 'SEARCH_ENGINE',
        char: 'E',
        description:
            'Connect assuming the search engine (Elasticsearch or Opensearch) set in the SEARCH_ENGINE environment variable'
    }),
    elasticsearch_version: Flags.string({
        required: false,
        env: 'ELASTICSEARCH_VERSION',
        char: 'V',
        description:
            'Run migration with Elasticsearch version set in ELASTICSEARCH_VERSION environment variable'
    }),
    elasticsearch_host: Flags.string({
        required: false,
        env: 'ELASTICSEARCH_HOST',
        char: 'H',
        description:
            'Connect to Elasticsearch with the value set in the ELASTICSEARCH_HOST environment variable'
    }),
    elasticsearch_ssl: Flags.string({
        required: false,
        env: 'ELASTICSEARCH_SSL',
        char: 'S',
        description:
            'Connect to Elasticsearch with the value set in the ELASTICSEARCH_SSL environment variable'
    }),
    elasticsearch_cloudid: Flags.string({
        required: false,
        env: 'ELASTICSEARCH_CLOUDID',
        char: 'C',
        description:
            'Connect to Elasticsearch with the value set in the ELASTICSEARCH_CLOUDID environment variable'
    }),
    elasticsearch_username: Flags.string({
        required: false,
        env: 'ELASTICSEARCH_USERNAME',
        char: 'U',
        description:
            'Connect to Elasticsearch with the value set in the ELASTICSEARCH_USERNAME environment variable'
    }),
    elasticsearch_password: Flags.string({
        required: false,
        env: 'ELASTICSEARCH_PASSWORD',
        char: 'P',
        description:
            'Connect to Elasticsearch with the value set in the ELASTICSEARCH_PASSWORD environment variable'
    })
};

export const DefaultFlags = {
    help: Flags.help({ char: 'h' }),
    version: Flags.version(),
    option_file: Flags.string({
        required: false,
        char: 'O',
        description:
            'Load migration setting file (.json) from file path (Environment variables take precedence)'
    })
};
