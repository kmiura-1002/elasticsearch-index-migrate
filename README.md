elasticsearch-index-migrate
===========================

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/elasticsearch-index-migrate.svg)](https://npmjs.org/package/elasticsearch-index-migrate)
[![Downloads/week](https://img.shields.io/npm/dw/elasticsearch-index-migrate.svg)](https://npmjs.org/package/elasticsearch-index-migrate)
[![License](https://img.shields.io/npm/l/elasticsearch-index-migrate.svg)](https://github.com/kmiura-1002/elasticsearch-index-migrate/blob/master/package.json)

This software is a mapping migration tool for Elasticsearch.  
It supports versions 6.x and 7.x of Elasticsearch.


<!-- toc -->
* [Requirements](#requirements)
* [Usage](#usage)
* [Setting](#setting)
* [Migration script](#migration-script)
* [Where to store migration scripts](#where-to-store-migration-scripts)
* [Commands](#commands)
<!-- tocstop -->

# Requirements
* node.js (>=10.15.0)  
* npm (>=6.9)  
* elasticsearch 6.x and 7.x  

This project has been tested with node.js(v10.15.3), npm(6.14.3) and elasticsearch(6.8.6 and 7.5.2).

# Usage
<!-- usage -->
```sh-session
$ npm install -g elasticsearch-index-migrate
$ elasticsearch-index-migrate COMMAND
running command...
$ elasticsearch-index-migrate (-v|--version|version)
elasticsearch-index-migrate/0.1.0 darwin-x64 node-v10.15.3
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
* elasticsearch.version : Enter the version of Elasticsearch you are using.
* elasticsearch.connect.host :  Enter the Elasticsearch Host you are using.
* elasticsearch.connect.sslCa : Fill in the location of your Elasticsearch SSL certificate.
* elasticsearch.connect.cloudId : Enter your Elasticsearch Cloud ID.
* elasticsearch.connect.username : Enter your Elasticsearch username.
* elasticsearch.connect.password : Enter your Elasticsearch password.
* migration.locations : Enter the full path to the directory where you want to store your migration script.
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

## Migration script format

In the case of ADD_FIELD scripts, describe the mapping information that can be executed with the Put mapping API under the migrate_script property.

```
{
  "type": "ADD_FIELD",
  "index_name": "indexName",
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
  "index_name": "indexName",
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

# Where to store migration scripts
Save your migration script to the directory you set up in ELASTICSEARCH_MIGRATION_LOCATIONS or JSON's migration.locations.
If the storage location is /elasticsearch/migration, store the script in a directory like the following.
This example is for the index names {index_name}_v1 and {index_name}_v2.
If the index name has a version, it is necessary to separate the directories.For names in the form {index_name}-{version} or {index_name}_{version}, separate the directory from {index_name}/{version}/. In this case, please put the following script in {version}/.

```
elasticsearch/
  ┗ migration/
    ┣ indices/
    │   ┗ {index_name}/
    │      ┣ v1/ 
    │      │  ┣ V1.0.0__init_mapping.json
    │      │  ┗ V1.0.1__add_field.json 
    │      ┣ v2/
    │      │  ┣ V2.0.0__init_mapping.json
    │      │  ┗ V2.0.1__add_field.json 
    │      ┗ v3/
```

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

_See code: [src/commands/info.ts](https://github.com/kmiura-1002/elasticsearch-index-migrate/blob/v0.1.0/src/commands/info.ts)_

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

_See code: [src/commands/init.ts](https://github.com/kmiura-1002/elasticsearch-index-migrate/blob/v0.1.0/src/commands/init.ts)_

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

_See code: [src/commands/migrate.ts](https://github.com/kmiura-1002/elasticsearch-index-migrate/blob/v0.1.0/src/commands/migrate.ts)_
<!-- commandsstop -->
