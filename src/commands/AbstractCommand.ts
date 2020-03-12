import { Command, flags } from '@oclif/command';
import { MigrationConfigType } from '../model/types';

export const DefaultOptions = {
    help: flags.help({ char: 'h' }),
    migration_locations: flags.string({
        multiple: true,
        required: false,
        env: 'ELASTICSEARCH_MIGRATION_LOCATIONS',
        description:
            'Read the migration file from the directory set in the $ELASTICSEARCH_MIGRATION_LOCATIONS environment variable'
    }),
    baseline_version: flags.string({
        required: false,
        env: 'ELASTICSEARCH_MIGRATION_BASELINE_VERSION',
        description:
            'Migrate from the baseline set in the ELASTICSEARCH_MIGRATION_BASELINE_VERSION environment variable'
    }),
    elasticsearch_version: flags.string({
        required: false,
        env: 'ELASTICSEARCH_VERSION',
        description:
            'Run migration with Elasticsearch version set in ELASTICSEARCH_VERSION environment variable'
    }),
    elasticsearch_host: flags.string({
        required: false,
        env: 'ELASTICSEARCH_HOST',
        description:
            'Connect to Elasticsearch with the value set in the ELASTICSEARCH_HOST environment variable'
    }),
    elasticsearch_ssl: flags.string({
        required: false,
        env: 'ELASTICSEARCH_SSL',
        description:
            'Connect to Elasticsearch with the value set in the ELASTICSEARCH_SSL environment variable'
    }),
    elasticsearch_cloudid: flags.string({
        required: false,
        env: 'ELASTICSEARCH_CLOUDID',
        description:
            'Connect to Elasticsearch with the value set in the ELASTICSEARCH_CLOUDID environment variable'
    }),
    elasticsearch_username: flags.string({
        required: false,
        env: 'ELASTICSEARCH_USERNAME',
        description:
            'Connect to Elasticsearch with the value set in the ELASTICSEARCH_USERNAME environment variable'
    }),
    elasticsearch_password: flags.string({
        required: false,
        env: 'ELASTICSEARCH_PASSWORD',
        description:
            'Connect to Elasticsearch with the value set in the ELASTICSEARCH_PASSWORD environment variable'
    })
};

export default abstract class extends Command {
    static flags = {
        ...DefaultOptions
    };
    migrationConfig: MigrationConfigType = {
        elasticsearch: {
            version: '7',
            connect: { host: 'http://localhost:9202' }
        },
        migration: {
            locations: ['migration'],
            baselineVersion: 'v1.0.0'
        }
    };

    async init() {
        const { flags } = this.parse();
        const {
            migration_locations,
            baseline_version,
            elasticsearch_version,
            elasticsearch_host,
            elasticsearch_ssl,
            elasticsearch_cloudid,
            elasticsearch_username,
            elasticsearch_password
        } = flags;

        if (migration_locations) {
            this.migrationConfig = {
                ...this.migrationConfig,
                migration: {
                    locations: migration_locations,
                    baselineVersion: this.migrationConfig.migration.baselineVersion
                }
            };
        }
        if (baseline_version) {
            this.migrationConfig = {
                ...this.migrationConfig,
                migration: {
                    locations: this.migrationConfig.migration.locations,
                    baselineVersion: baseline_version
                }
            };
        }
        if (elasticsearch_version) {
            this.migrationConfig = {
                ...this.migrationConfig,
                elasticsearch: {
                    ...this.migrationConfig.elasticsearch,
                    version: elasticsearch_version
                }
            };
        }
        if (elasticsearch_host) {
            this.migrationConfig = {
                ...this.migrationConfig,
                elasticsearch: {
                    ...this.migrationConfig.elasticsearch,
                    connect: {
                        ...this.migrationConfig.elasticsearch.connect,
                        host: elasticsearch_host
                    }
                }
            };
        }

        if (elasticsearch_ssl) {
            this.migrationConfig = {
                ...this.migrationConfig,
                elasticsearch: {
                    ...this.migrationConfig.elasticsearch,
                    connect: {
                        ...this.migrationConfig.elasticsearch.connect,
                        sslCa: elasticsearch_ssl
                    }
                }
            };
        }

        if (elasticsearch_cloudid) {
            this.migrationConfig = {
                ...this.migrationConfig,
                elasticsearch: {
                    ...this.migrationConfig.elasticsearch,
                    connect: {
                        ...this.migrationConfig.elasticsearch.connect,
                        cloudId: elasticsearch_cloudid
                    }
                }
            };
        }

        if (elasticsearch_username) {
            this.migrationConfig = {
                ...this.migrationConfig,
                elasticsearch: {
                    ...this.migrationConfig.elasticsearch,
                    connect: {
                        ...this.migrationConfig.elasticsearch.connect,
                        username: elasticsearch_username
                    }
                }
            };
        }

        if (elasticsearch_password) {
            this.migrationConfig = {
                ...this.migrationConfig,
                elasticsearch: {
                    ...this.migrationConfig.elasticsearch,
                    connect: {
                        ...this.migrationConfig.elasticsearch.connect,
                        password: elasticsearch_password
                    }
                }
            };
        }
    }
}
