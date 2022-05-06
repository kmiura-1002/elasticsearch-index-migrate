elasticsearch-index-migrate
===========================

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/elasticsearch-index-migrate.svg)](https://npmjs.org/package/elasticsearch-index-migrate)
[![Downloads/week](https://img.shields.io/npm/dw/elasticsearch-index-migrate.svg)](https://npmjs.org/package/elasticsearch-index-migrate)
[![License](https://img.shields.io/npm/l/elasticsearch-index-migrate.svg)](https://github.com/kmiura-1002/elasticsearch-index-migrate/blob/master/package.json)

This software is a command line tool for version control and mapping changes of Elasticsearch mappings.  
Elasticsearch versions 6.x and 7.x (up to 7.7.0) are supported.  
You can see [a sample of this tool here](https://github.com/kmiura-1002/sample-elasticsearch-index-migrate).

<!-- toc -->
* [Requirements](#requirements)
* [Usage](#usage)
* [Setting](#setting)
* [Migration script](#migration-script)
* [Query parameters](#query-parameters)
* [Where to store migration scripts](#where-to-store-migration-scripts)
* [Commands](#commands)
* [Quick start with Docker](#quick-start-with-docker)
<!-- tocstop -->

# Requirements
* node.js (>=12.14.0)  
* npm (>=6.14.7)  
* elasticsearch 6.x and 7.x  

This project has been tested with node.js(v12.14.0, v14.15.5), npm(6.14.7) and elasticsearch(6.8.12 and 7.7.1).

# Usage
<!-- usage -->
```sh-session
$ npm install -g elasticsearch-index-migrate
$ elasticsearch-index-migrate COMMAND
running command...
$ elasticsearch-index-migrate (-v|--version|version)
elasticsearch-index-migrate/0.8.2 darwin-x64 node-v14.17.6
$ elasticsearch-index-migrate --help [COMMAND]
USAGE
  $ elasticsearch-index-migrate COMMAND
...
```
<!-- usagestop -->

# Setting

You need to configure the connection settings and migration settings for this software.  
The settings can be written in JSON format or read from environment variables.  
A JSON file is read by passing a path to the argument of the executable command.
If you set it in an environment variable, the system will read it automatically when you execute the command.  
If you put a configuration file named `config.json` in `~/.config/elasticsearch-index-migrate/`, it will be loaded automatically.  
The environment variables take precedence over the settings. Then the `-O` option takes precedence.  

If you want to use a JSON file, please use the following.  

```json
{
    "elasticsearch": {
        "version": "7",
        "connect": {
            "host": "http://0.0.0.0:9202",
            "sslCa": "",
            "cloudId": "",
            "username": "",
            "password": ""
        }
    },
    "migration": {
        "locations": ["/migration"],
        "baselineVersion": "v1.0.0"
    }
}

```
* elasticsearch.version : Enter the version of Elasticsearch you are using. If you are using OpenSearch, please write 'opensearch'.
* elasticsearch.connect.host :  Enter the Elasticsearch Host you are using.
* elasticsearch.connect.sslCa : Fill in the location of your Elasticsearch SSL certificate.
* elasticsearch.connect.cloudId : Enter your Elasticsearch Cloud ID.
* elasticsearch.connect.username : Enter your Elasticsearch username.
* elasticsearch.connect.password : Enter your Elasticsearch password.
* migration.locations : Enter the full path or relative path to the directory where you want to store your migration script
* migration.baselineVersion : Please fill in the base version of the migration script

To set the environment variables, set the following variables.
* ELASTICSEARCH_MIGRATION_LOCATIONS  
* ELASTICSEARCH_MIGRATION_BASELINE_VERSION  
* ELASTICSEARCH_VERSION  
* ELASTICSEARCH_HOST  
* ELASTICSEARCH_SSL  
* ELASTICSEARCH_CLOUDID  
* ELASTICSEARCH_USERNAME  
* ELASTICSEARCH_PASSWORD  

# Migration script
Migration scripts are written in JSON format. File names should follow the format v{version}__{name}.json.

Currently the following migration types are supported:
* ADD_FIELD
* CREATE_INDEX
* DELETE_INDEX
* ALTER_SETTING
* CREATE_DOCUMENT

## Migration script format

In the case of ADD_FIELD scripts, describe the mapping information that can be executed with the Put mapping API under the migrate_script property.

```
{
  "type": "ADD_FIELD",
  "description": "description",
  "migrate_script": {
    "properties": {
      "user_id": {
        "type": "keyword"
      },
      ...
    }
  }
}
```

In the case of CREATE_INDEX scripts, write a Request body that can be executed with the Create index API under the migrate_script property.

```
{
  "type": "CREATE_INDEX",
  "description": "description",
  "migrate_script": {
    "settings": {
        "index": {
            "refresh_interval": "1s",
            "number_of_shards": 1,
            "number_of_replicas": 0
        }
    },
    "mappings": {
        "properties": {
          "user_id": {
            "type": "keyword"
          },
          ...
        }
    }
  }
}
```

For a DELETE_INDEX script, do the following.
```
{
  "type": "DELETE_INDEX",
  "description": "description"
}
```

In the case of ALTER_SETTING scripts, write a Request body that can be executed with the Update Indices Settings API under the migrate_script property.
```
{
  "type": "ALTER_SETTING",
  "description": "description",
  "migrate_script": {
    "index" : {
        "number_of_replicas" : 1
    }
  }
}
```

Sometimes when [database seeding](https://en.wikipedia.org/wiki/Database_seeding) is needed CREATE_DOCUMENT may be useful. __data__ property accepts a single document or list of documents.

```
{
  "type": "CREATE_DOCUMENT",
  "description": "description",
  "data": {
    "id": "00000000-0000-0000-0000-000000000000",
    ...
  }
}
```

# Query parameters
Query parameters can be specified in JSON format in the migration script. 
You can use the query parameters according to the migration type. 
For more information, please check out [Elasticsearch](https://www.elastic.co/guide/en/elasticsearch/reference/current/rest-apis.html).

For Example:
```
{
  "type": "CREATE_INDEX",
  "description": "description",
  "migrate_script": {
    "settings": {
        "index": {
            "refresh_interval": "1s",
            "number_of_shards": 1,
            "number_of_replicas": 0
        }
    },
    "mappings": {
        "properties": {
          "user_id": {
            "type": "keyword"
          },
          ...
        }
    }
  },
  "query_parameters": {
    "include_type_name": true,
    "timeout": 10
  }
}
```

# Where to store migration scripts
Save your migration script to the directory you set up in ELASTICSEARCH_MIGRATION_LOCATIONS or JSON's migration.locations.
If the storage location is /elasticsearch/migration, store the script in a directory like the following.
This example is for the index names {index_name} and {index_name}\_v1, {index_name}\_v2.
If the index name has a version, it is necessary to separate the directories.For names in the form {index_name}-{version} or {index\_name}\_{version}, separate the directory from {index_name}/{version}/. In this case, please put the following script in {version}/.

```
elasticsearch/
  ┗ migration/
    ┣ indices/
    │   ┣ {index_name}/
    │   │  ┣ v1/ 
    │   │  │  ┣ V1.0.0__init_mapping.json
    │   │  │  ┗ V1.0.1__add_field.json 
    │   │  ┣ v2/
    │   │  │  ┣ V2.0.0__init_mapping.json
    │   │  │  ┗ V2.0.1__add_field.json 
    │   │  ┗ v3/
    │   ┗ {index_name}/
    │      ┗ V1.0.0__create_index.json
```

# Commands
<!-- commands -->
* [`elasticsearch-index-migrate baseline [NAME]`](#elasticsearch-index-migrate-baseline-name)
* [`elasticsearch-index-migrate clean [NAME]`](#elasticsearch-index-migrate-clean-name)
* [`elasticsearch-index-migrate help [COMMAND]`](#elasticsearch-index-migrate-help-command)
* [`elasticsearch-index-migrate init`](#elasticsearch-index-migrate-init)
* [`elasticsearch-index-migrate migrate [NAME]`](#elasticsearch-index-migrate-migrate-name)
* [`elasticsearch-index-migrate plan [NAME]`](#elasticsearch-index-migrate-plan-name)
* [`elasticsearch-index-migrate recovery [NAME]`](#elasticsearch-index-migrate-recovery-name)

## `elasticsearch-index-migrate baseline [NAME]`

Create a baseline in migration_history if you were running Elasticsearch before the tool was implemented.

```
USAGE
  $ elasticsearch-index-migrate baseline [NAME]

ARGUMENTS
  NAME  migration index name.

OPTIONS
  -B, --baseline_version=baseline_version              Migrate from the baseline set in the
                                                       ELASTICSEARCH_MIGRATION_BASELINE_VERSION environment variable

  -C, --elasticsearch_cloudid=elasticsearch_cloudid    Connect to Elasticsearch with the value set in the
                                                       ELASTICSEARCH_CLOUDID environment variable

  -D, --delimiter=delimiter                            The separator between index name and index version.

  -H, --elasticsearch_host=elasticsearch_host          Connect to Elasticsearch with the value set in the
                                                       ELASTICSEARCH_HOST environment variable

  -I, --elasticsearch_ssl_insecure                     If true, allow insecure server connections when using SSL.

  -L, --migration_locations=migration_locations        Read the migration file from the directory set in the
                                                       $ELASTICSEARCH_MIGRATION_LOCATIONS environment variable

  -O, --option_file=option_file                        Load migration setting file (.json) from file path (Environment
                                                       variables take precedence)

  -P, --elasticsearch_password=elasticsearch_password  Connect to Elasticsearch with the value set in the
                                                       ELASTICSEARCH_PASSWORD environment variable

  -S, --elasticsearch_ssl=elasticsearch_ssl            Connect to Elasticsearch with the value set in the
                                                       ELASTICSEARCH_SSL environment variable

  -U, --elasticsearch_username=elasticsearch_username  Connect to Elasticsearch with the value set in the
                                                       ELASTICSEARCH_USERNAME environment variable

  -V, --elasticsearch_version=elasticsearch_version    Run migration with Elasticsearch version set in
                                                       ELASTICSEARCH_VERSION environment variable

  -d, --description=description                        Description to be saved to history.

  -h, --help                                           show CLI help

  -i, --indexName=indexName                            migration index name.

  -n, --[no-]natural-name                              Set to true if the index name contains _ or -(Ex: my-index).

  -r, --number-of-replicas=number-of-replicas          [default: 2] number of replicas in migration history index.

  -s, --number-of-shards=number-of-shards              [default: 1] number of shards in migration history index.

  -v, --index-version=index-version                    index version. (Ex: For my-index_1970.01.01, the version is
                                                       1970.01.01. For my-index_v1, the version is v1.)

  --[no-]init                                          If the init command has not been executed in advance, the
                                                       migration will be performed after initialization has been
                                                       processed.
```

_See code: [src/commands/baseline.ts](https://github.com/kmiura-1002/elasticsearch-index-migrate/blob/v0.8.2/src/commands/baseline.ts)_

## `elasticsearch-index-migrate clean [NAME]`

Delete all history stored in the migration_history index

```
USAGE
  $ elasticsearch-index-migrate clean [NAME]

ARGUMENTS
  NAME  migration index name.

OPTIONS
  -B, --baseline_version=baseline_version              Migrate from the baseline set in the
                                                       ELASTICSEARCH_MIGRATION_BASELINE_VERSION environment variable

  -C, --elasticsearch_cloudid=elasticsearch_cloudid    Connect to Elasticsearch with the value set in the
                                                       ELASTICSEARCH_CLOUDID environment variable

  -D, --delimiter=delimiter                            The separator between index name and index version.

  -H, --elasticsearch_host=elasticsearch_host          Connect to Elasticsearch with the value set in the
                                                       ELASTICSEARCH_HOST environment variable

  -I, --elasticsearch_ssl_insecure                     If true, allow insecure server connections when using SSL.

  -L, --migration_locations=migration_locations        Read the migration file from the directory set in the
                                                       $ELASTICSEARCH_MIGRATION_LOCATIONS environment variable

  -O, --option_file=option_file                        Load migration setting file (.json) from file path (Environment
                                                       variables take precedence)

  -P, --elasticsearch_password=elasticsearch_password  Connect to Elasticsearch with the value set in the
                                                       ELASTICSEARCH_PASSWORD environment variable

  -S, --elasticsearch_ssl=elasticsearch_ssl            Connect to Elasticsearch with the value set in the
                                                       ELASTICSEARCH_SSL environment variable

  -U, --elasticsearch_username=elasticsearch_username  Connect to Elasticsearch with the value set in the
                                                       ELASTICSEARCH_USERNAME environment variable

  -V, --elasticsearch_version=elasticsearch_version    Run migration with Elasticsearch version set in
                                                       ELASTICSEARCH_VERSION environment variable

  -h, --help                                           show CLI help

  -i, --indexName=indexName                            migration index name.

  -n, --[no-]natural-name                              Set to true if the index name contains _ or -(Ex: my-index).

  -r, --number-of-replicas=number-of-replicas          [default: 2] number of replicas in migration history index.

  -s, --number-of-shards=number-of-shards              [default: 1] number of shards in migration history index.

  -t, --target=(history|index|all)                     [default: history] Selecting what to delete
                                                       history : Delete the target index migration history from
                                                       migration_history
                                                       index : Delete the target index from elasticsearch
                                                       all : Delete both migration history and index

  -v, --index-version=index-version                    index version. (Ex: For my-index_1970.01.01, the version is
                                                       1970.01.01. For my-index_v1, the version is v1.)

  -y, --yes                                            Always answer "yes" to any prompt that appears during processing

  --[no-]init                                          If the init command has not been executed in advance, the
                                                       migration will be performed after initialization has been
                                                       processed.
```

_See code: [src/commands/clean.ts](https://github.com/kmiura-1002/elasticsearch-index-migrate/blob/v0.8.2/src/commands/clean.ts)_

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

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.2.14/src/commands/help.ts)_

## `elasticsearch-index-migrate init`

Set up a migration environment.

```
USAGE
  $ elasticsearch-index-migrate init

OPTIONS
  -B, --baseline_version=baseline_version              Migrate from the baseline set in the
                                                       ELASTICSEARCH_MIGRATION_BASELINE_VERSION environment variable

  -C, --elasticsearch_cloudid=elasticsearch_cloudid    Connect to Elasticsearch with the value set in the
                                                       ELASTICSEARCH_CLOUDID environment variable

  -H, --elasticsearch_host=elasticsearch_host          Connect to Elasticsearch with the value set in the
                                                       ELASTICSEARCH_HOST environment variable

  -I, --elasticsearch_ssl_insecure                     If true, allow insecure server connections when using SSL.

  -L, --migration_locations=migration_locations        Read the migration file from the directory set in the
                                                       $ELASTICSEARCH_MIGRATION_LOCATIONS environment variable

  -O, --option_file=option_file                        Load migration setting file (.json) from file path (Environment
                                                       variables take precedence)

  -P, --elasticsearch_password=elasticsearch_password  Connect to Elasticsearch with the value set in the
                                                       ELASTICSEARCH_PASSWORD environment variable

  -S, --elasticsearch_ssl=elasticsearch_ssl            Connect to Elasticsearch with the value set in the
                                                       ELASTICSEARCH_SSL environment variable

  -U, --elasticsearch_username=elasticsearch_username  Connect to Elasticsearch with the value set in the
                                                       ELASTICSEARCH_USERNAME environment variable

  -V, --elasticsearch_version=elasticsearch_version    Run migration with Elasticsearch version set in
                                                       ELASTICSEARCH_VERSION environment variable

  -h, --help                                           show CLI help

  -r, --number-of-replicas=number-of-replicas          [default: 2] number of replicas in migration history index.

  -s, --number-of-shards=number-of-shards              [default: 1] number of shards in migration history index.
```

_See code: [src/commands/init.ts](https://github.com/kmiura-1002/elasticsearch-index-migrate/blob/v0.8.2/src/commands/init.ts)_

## `elasticsearch-index-migrate migrate [NAME]`

Migrate the index of Elasticsearch to the latest version based on the execution plan.

```
USAGE
  $ elasticsearch-index-migrate migrate [NAME]

ARGUMENTS
  NAME  migration index name.

OPTIONS
  -B, --baseline_version=baseline_version              Migrate from the baseline set in the
                                                       ELASTICSEARCH_MIGRATION_BASELINE_VERSION environment variable

  -C, --elasticsearch_cloudid=elasticsearch_cloudid    Connect to Elasticsearch with the value set in the
                                                       ELASTICSEARCH_CLOUDID environment variable

  -D, --delimiter=delimiter                            The separator between index name and index version.

  -H, --elasticsearch_host=elasticsearch_host          Connect to Elasticsearch with the value set in the
                                                       ELASTICSEARCH_HOST environment variable

  -I, --elasticsearch_ssl_insecure                     If true, allow insecure server connections when using SSL.

  -L, --migration_locations=migration_locations        Read the migration file from the directory set in the
                                                       $ELASTICSEARCH_MIGRATION_LOCATIONS environment variable

  -O, --option_file=option_file                        Load migration setting file (.json) from file path (Environment
                                                       variables take precedence)

  -P, --elasticsearch_password=elasticsearch_password  Connect to Elasticsearch with the value set in the
                                                       ELASTICSEARCH_PASSWORD environment variable

  -S, --elasticsearch_ssl=elasticsearch_ssl            Connect to Elasticsearch with the value set in the
                                                       ELASTICSEARCH_SSL environment variable

  -U, --elasticsearch_username=elasticsearch_username  Connect to Elasticsearch with the value set in the
                                                       ELASTICSEARCH_USERNAME environment variable

  -V, --elasticsearch_version=elasticsearch_version    Run migration with Elasticsearch version set in
                                                       ELASTICSEARCH_VERSION environment variable

  -h, --help                                           show CLI help

  -i, --indexName=indexName                            migration index name.

  -n, --[no-]natural-name                              Set to true if the index name contains _ or -(Ex: my-index).

  -r, --number-of-replicas=number-of-replicas          [default: 2] number of replicas in migration history index.

  -s, --number-of-shards=number-of-shards              [default: 1] number of shards in migration history index.

  -v, --index-version=index-version                    index version. (Ex: For my-index_1970.01.01, the version is
                                                       1970.01.01. For my-index_v1, the version is v1.)

  --[no-]init                                          If the init command has not been executed in advance, the
                                                       migration will be performed after initialization has been
                                                       processed.

  --showDiff                                           Outputs the difference between before and after the migration at
                                                       the end.
```

_See code: [src/commands/migrate.ts](https://github.com/kmiura-1002/elasticsearch-index-migrate/blob/v0.8.2/src/commands/migrate.ts)_

## `elasticsearch-index-migrate plan [NAME]`

Outputs the migration execution plan.

```
USAGE
  $ elasticsearch-index-migrate plan [NAME]

ARGUMENTS
  NAME  migration index name.

OPTIONS
  -B, --baseline_version=baseline_version              Migrate from the baseline set in the
                                                       ELASTICSEARCH_MIGRATION_BASELINE_VERSION environment variable

  -C, --elasticsearch_cloudid=elasticsearch_cloudid    Connect to Elasticsearch with the value set in the
                                                       ELASTICSEARCH_CLOUDID environment variable

  -D, --delimiter=delimiter                            The separator between index name and index version.

  -H, --elasticsearch_host=elasticsearch_host          Connect to Elasticsearch with the value set in the
                                                       ELASTICSEARCH_HOST environment variable

  -I, --elasticsearch_ssl_insecure                     If true, allow insecure server connections when using SSL.

  -L, --migration_locations=migration_locations        Read the migration file from the directory set in the
                                                       $ELASTICSEARCH_MIGRATION_LOCATIONS environment variable

  -O, --option_file=option_file                        Load migration setting file (.json) from file path (Environment
                                                       variables take precedence)

  -P, --elasticsearch_password=elasticsearch_password  Connect to Elasticsearch with the value set in the
                                                       ELASTICSEARCH_PASSWORD environment variable

  -S, --elasticsearch_ssl=elasticsearch_ssl            Connect to Elasticsearch with the value set in the
                                                       ELASTICSEARCH_SSL environment variable

  -U, --elasticsearch_username=elasticsearch_username  Connect to Elasticsearch with the value set in the
                                                       ELASTICSEARCH_USERNAME environment variable

  -V, --elasticsearch_version=elasticsearch_version    Run migration with Elasticsearch version set in
                                                       ELASTICSEARCH_VERSION environment variable

  -h, --help                                           show CLI help

  -i, --indexName=indexName                            migration index name.

  -n, --[no-]natural-name                              Set to true if the index name contains _ or -(Ex: my-index).

  -r, --number-of-replicas=number-of-replicas          [default: 2] number of replicas in migration history index.

  -s, --number-of-shards=number-of-shards              [default: 1] number of shards in migration history index.

  -v, --index-version=index-version                    index version. (Ex: For my-index_1970.01.01, the version is
                                                       1970.01.01. For my-index_v1, the version is v1.)

  --[no-]init                                          If the init command has not been executed in advance, the
                                                       migration will be performed after initialization has been
                                                       processed.
```

_See code: [src/commands/plan.ts](https://github.com/kmiura-1002/elasticsearch-index-migrate/blob/v0.8.2/src/commands/plan.ts)_

## `elasticsearch-index-migrate recovery [NAME]`

Delete failed migration history.

```
USAGE
  $ elasticsearch-index-migrate recovery [NAME]

ARGUMENTS
  NAME  migration index name.

OPTIONS
  -B, --baseline_version=baseline_version              Migrate from the baseline set in the
                                                       ELASTICSEARCH_MIGRATION_BASELINE_VERSION environment variable

  -C, --elasticsearch_cloudid=elasticsearch_cloudid    Connect to Elasticsearch with the value set in the
                                                       ELASTICSEARCH_CLOUDID environment variable

  -D, --delimiter=delimiter                            The separator between index name and index version.

  -H, --elasticsearch_host=elasticsearch_host          Connect to Elasticsearch with the value set in the
                                                       ELASTICSEARCH_HOST environment variable

  -I, --elasticsearch_ssl_insecure                     If true, allow insecure server connections when using SSL.

  -L, --migration_locations=migration_locations        Read the migration file from the directory set in the
                                                       $ELASTICSEARCH_MIGRATION_LOCATIONS environment variable

  -O, --option_file=option_file                        Load migration setting file (.json) from file path (Environment
                                                       variables take precedence)

  -P, --elasticsearch_password=elasticsearch_password  Connect to Elasticsearch with the value set in the
                                                       ELASTICSEARCH_PASSWORD environment variable

  -S, --elasticsearch_ssl=elasticsearch_ssl            Connect to Elasticsearch with the value set in the
                                                       ELASTICSEARCH_SSL environment variable

  -U, --elasticsearch_username=elasticsearch_username  Connect to Elasticsearch with the value set in the
                                                       ELASTICSEARCH_USERNAME environment variable

  -V, --elasticsearch_version=elasticsearch_version    Run migration with Elasticsearch version set in
                                                       ELASTICSEARCH_VERSION environment variable

  -h, --help                                           show CLI help

  -i, --indexName=indexName                            migration index name.

  -n, --[no-]natural-name                              Set to true if the index name contains _ or -(Ex: my-index).

  -r, --number-of-replicas=number-of-replicas          [default: 2] number of replicas in migration history index.

  -s, --number-of-shards=number-of-shards              [default: 1] number of shards in migration history index.

  -v, --index-version=index-version                    index version. (Ex: For my-index_1970.01.01, the version is
                                                       1970.01.01. For my-index_v1, the version is v1.)

  --[no-]init                                          If the init command has not been executed in advance, the
                                                       migration will be performed after initialization has been
                                                       processed.
```

_See code: [src/commands/recovery.ts](https://github.com/kmiura-1002/elasticsearch-index-migrate/blob/v0.8.2/src/commands/recovery.ts)_
<!-- commandsstop -->

# Quick start with Docker

The commands of this CLI tool are published as docker images. I think it would be more useful to use this image.

## Usage

Please pull the docker image.
After that, you can run `docker run --rm` and enter any command and options to use it

```sh-session
$ docker pull kmiura1002/elasticsearch-index-migrate
$ docker run --rm  kmiura1002/elasticsearch-index-migrate -h
  elasticsearch-index-migrate
  
  VERSION
    elasticsearch-index-migrate/0.1.2 linux-x64 node-v12.16.3
  
  USAGE
    $ elasticsearch-index-migrate [COMMAND]
  
  COMMANDS
    help     display help for elasticsearch-index-migrate
    init     Set up a migration environment.
    migrate  Migrate the index of Elasticsearch to the latest version based on the
             execution plan.
    plan     Outputs the migration execution plan.

```
