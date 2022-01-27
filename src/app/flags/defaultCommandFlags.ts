import { flags } from '@oclif/command';

export const esConnectionFlags = {
    search_engine: flags.string({
        required: false,
        env: 'SEARCH_ENGINE',
        char: 'E',
        description:
            'Connect assuming the search engine (Elasticsearch or Opensearch) set in the SEARCH_ENGINE environment variable'
    }),
    elasticsearch_version: flags.string({
        required: false,
        env: 'ELASTICSEARCH_VERSION',
        char: 'V',
        description:
            'Run migration with Elasticsearch version set in ELASTICSEARCH_VERSION environment variable'
    }),
    elasticsearch_host: flags.string({
        required: false,
        env: 'ELASTICSEARCH_HOST',
        char: 'H',
        description:
            'Connect to Elasticsearch with the value set in the ELASTICSEARCH_HOST environment variable'
    }),
    elasticsearch_ssl: flags.string({
        required: false,
        env: 'ELASTICSEARCH_SSL',
        char: 'S',
        description:
            'Connect to Elasticsearch with the value set in the ELASTICSEARCH_SSL environment variable'
    }),
    elasticsearch_cloudid: flags.string({
        required: false,
        env: 'ELASTICSEARCH_CLOUDID',
        char: 'C',
        description:
            'Connect to Elasticsearch with the value set in the ELASTICSEARCH_CLOUDID environment variable'
    }),
    elasticsearch_username: flags.string({
        required: false,
        env: 'ELASTICSEARCH_USERNAME',
        char: 'U',
        description:
            'Connect to Elasticsearch with the value set in the ELASTICSEARCH_USERNAME environment variable'
    }),
    elasticsearch_password: flags.string({
        required: false,
        env: 'ELASTICSEARCH_PASSWORD',
        char: 'P',
        description:
            'Connect to Elasticsearch with the value set in the ELASTICSEARCH_PASSWORD environment variable'
    })
};

export const DefaultFlags = {
    help: flags.help({ char: 'h' }),
    option_file: flags.string({
        required: false,
        char: 'O',
        description:
            'Load migration setting file (.json) from file path (Environment variables take precedence)'
    })
};
