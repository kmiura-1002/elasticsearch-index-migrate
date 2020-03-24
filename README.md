elasticsearch-index-migrate
===========================

elasticsearch-index-migrate

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/elasticsearch-index-migrate.svg)](https://npmjs.org/package/elasticsearch-index-migrate)
[![Downloads/week](https://img.shields.io/npm/dw/elasticsearch-index-migrate.svg)](https://npmjs.org/package/elasticsearch-index-migrate)
[![License](https://img.shields.io/npm/l/elasticsearch-index-migrate.svg)](https://github.com/kmiura-1002/elasticsearch-index-migrate/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g elasticsearch-index-migrate
$ elasticsearch-index-migrate COMMAND
running command...
$ elasticsearch-index-migrate (-v|--version|version)
elasticsearch-index-migrate/0.0.1 darwin-x64 node-v10.15.3
$ elasticsearch-index-migrate --help [COMMAND]
USAGE
  $ elasticsearch-index-migrate COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`elasticsearch-index-migrate help [COMMAND]`](#elasticsearch-index-migrate-help-command)
* [`elasticsearch-index-migrate info`](#elasticsearch-index-migrate-info)
* [`elasticsearch-index-migrate init`](#elasticsearch-index-migrate-init)
* [`elasticsearch-index-migrate migrate`](#elasticsearch-index-migrate-migrate)

## `elasticsearch-index-migrate help [COMMAND]`

display help for elasticsearch-index-migrate

```
USAGE
  $ elasticsearch-index-migrate help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v2.2.3/src/commands/help.ts)_

## `elasticsearch-index-migrate info`

Prints the details and status information about all the migrations.

```
USAGE
  $ elasticsearch-index-migrate info

OPTIONS
  -O, --option_file=option_file                    Load migration setting file (.json) from file path (Environment
                                                   variables take precedence)

  -h, --help                                       show CLI help

  -i, --indexName=indexName                        (required) migration index name.

  --baseline_version=baseline_version              Migrate from the baseline set in the
                                                   ELASTICSEARCH_MIGRATION_BASELINE_VERSION environment variable

  --elasticsearch_cloudid=elasticsearch_cloudid    Connect to Elasticsearch with the value set in the
                                                   ELASTICSEARCH_CLOUDID environment variable

  --elasticsearch_host=elasticsearch_host          Connect to Elasticsearch with the value set in the ELASTICSEARCH_HOST
                                                   environment variable

  --elasticsearch_password=elasticsearch_password  Connect to Elasticsearch with the value set in the
                                                   ELASTICSEARCH_PASSWORD environment variable

  --elasticsearch_ssl=elasticsearch_ssl            Connect to Elasticsearch with the value set in the ELASTICSEARCH_SSL
                                                   environment variable

  --elasticsearch_username=elasticsearch_username  Connect to Elasticsearch with the value set in the
                                                   ELASTICSEARCH_USERNAME environment variable

  --elasticsearch_version=elasticsearch_version    Run migration with Elasticsearch version set in ELASTICSEARCH_VERSION
                                                   environment variable

  --migration_locations=migration_locations        Read the migration file from the directory set in the
                                                   $ELASTICSEARCH_MIGRATION_LOCATIONS environment variable
```

_See code: [src/commands/info.ts](https://github.com/kmiura-1002/elasticsearch-index-migrate/blob/v0.0.1/src/commands/info.ts)_

## `elasticsearch-index-migrate init`

Setup elasticsearch index migrate env

```
USAGE
  $ elasticsearch-index-migrate init

OPTIONS
  -O, --option_file=option_file                    Load migration setting file (.json) from file path (Environment
                                                   variables take precedence)

  -h, --help                                       show CLI help

  --baseline_version=baseline_version              Migrate from the baseline set in the
                                                   ELASTICSEARCH_MIGRATION_BASELINE_VERSION environment variable

  --elasticsearch_cloudid=elasticsearch_cloudid    Connect to Elasticsearch with the value set in the
                                                   ELASTICSEARCH_CLOUDID environment variable

  --elasticsearch_host=elasticsearch_host          Connect to Elasticsearch with the value set in the ELASTICSEARCH_HOST
                                                   environment variable

  --elasticsearch_password=elasticsearch_password  Connect to Elasticsearch with the value set in the
                                                   ELASTICSEARCH_PASSWORD environment variable

  --elasticsearch_ssl=elasticsearch_ssl            Connect to Elasticsearch with the value set in the ELASTICSEARCH_SSL
                                                   environment variable

  --elasticsearch_username=elasticsearch_username  Connect to Elasticsearch with the value set in the
                                                   ELASTICSEARCH_USERNAME environment variable

  --elasticsearch_version=elasticsearch_version    Run migration with Elasticsearch version set in ELASTICSEARCH_VERSION
                                                   environment variable

  --migration_locations=migration_locations        Read the migration file from the directory set in the
                                                   $ELASTICSEARCH_MIGRATION_LOCATIONS environment variable
```

_See code: [src/commands/init.ts](https://github.com/kmiura-1002/elasticsearch-index-migrate/blob/v0.0.1/src/commands/init.ts)_

## `elasticsearch-index-migrate migrate`

Migrates Elasticsearch index to the latest version.

```
USAGE
  $ elasticsearch-index-migrate migrate

OPTIONS
  -O, --option_file=option_file                    Load migration setting file (.json) from file path (Environment
                                                   variables take precedence)

  -h, --help                                       show CLI help

  -i, --indexName=indexName                        (required) migration index name.

  --baseline_version=baseline_version              Migrate from the baseline set in the
                                                   ELASTICSEARCH_MIGRATION_BASELINE_VERSION environment variable

  --elasticsearch_cloudid=elasticsearch_cloudid    Connect to Elasticsearch with the value set in the
                                                   ELASTICSEARCH_CLOUDID environment variable

  --elasticsearch_host=elasticsearch_host          Connect to Elasticsearch with the value set in the ELASTICSEARCH_HOST
                                                   environment variable

  --elasticsearch_password=elasticsearch_password  Connect to Elasticsearch with the value set in the
                                                   ELASTICSEARCH_PASSWORD environment variable

  --elasticsearch_ssl=elasticsearch_ssl            Connect to Elasticsearch with the value set in the ELASTICSEARCH_SSL
                                                   environment variable

  --elasticsearch_username=elasticsearch_username  Connect to Elasticsearch with the value set in the
                                                   ELASTICSEARCH_USERNAME environment variable

  --elasticsearch_version=elasticsearch_version    Run migration with Elasticsearch version set in ELASTICSEARCH_VERSION
                                                   environment variable

  --migration_locations=migration_locations        Read the migration file from the directory set in the
                                                   $ELASTICSEARCH_MIGRATION_LOCATIONS environment variable
```

_See code: [src/commands/migrate.ts](https://github.com/kmiura-1002/elasticsearch-index-migrate/blob/v0.0.1/src/commands/migrate.ts)_
<!-- commandsstop -->
