import { Command, flags } from '@oclif/command';
import { MigrationConfigType } from './model/types';
import * as loadJsonFile from 'load-json-file';
import { cli } from 'cli-ux';

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
    }),
    option_file: flags.string({
        required: false,
        char: 'O',
        description:
            'Load migration setting file (.json) from file path (Environment variables take precedence)'
    })
};

export default abstract class AbstractCommand extends Command {
    // default config
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
            elasticsearch_password,
            option_file
        } = flags;

        if (
            migration_locations &&
            baseline_version &&
            (elasticsearch_version ||
                elasticsearch_host ||
                elasticsearch_ssl ||
                elasticsearch_cloudid ||
                elasticsearch_username ||
                elasticsearch_password)
        ) {
            this.migrationConfig = {
                elasticsearch: {
                    connect: {
                        host: elasticsearch_host,
                        sslCa: elasticsearch_ssl,
                        cloudId: elasticsearch_cloudid,
                        username: elasticsearch_username,
                        password: elasticsearch_password
                    },
                    version: elasticsearch_version
                },
                migration: {
                    locations:
                        typeof migration_locations === 'string'
                            ? [migration_locations]
                            : migration_locations,
                    baselineVersion: baseline_version
                }
            };
        } else if (option_file) {
            this.migrationConfig = { ...(await loadJsonFile<MigrationConfigType>(option_file)) };
        } else {
            cli.debug(`Default initial value set.`);
        }
    }
}
