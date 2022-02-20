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
elasticsearch-index-migrate/1.0.0 darwin-x64 node-v14.17.6
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
* elasticsearch.version : Enter the version of Elasticsearch you are using.
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
* [`elasticsearch-index-migrate clean [FILE]`](#elasticsearch-index-migrate-clean-file)
* [`elasticsearch-index-migrate clean:esindex [FILE]`](#elasticsearch-index-migrate-cleanesindex-file)
* [`elasticsearch-index-migrate clean:template [FILE]`](#elasticsearch-index-migrate-cleantemplate-file)
* [`elasticsearch-index-migrate help [COMMAND]`](#elasticsearch-index-migrate-help-command)
* [`elasticsearch-index-migrate migrate [FILE]`](#elasticsearch-index-migrate-migrate-file)
* [`elasticsearch-index-migrate migrate:esindex [FILE]`](#elasticsearch-index-migrate-migrateesindex-file)
* [`elasticsearch-index-migrate migrate:template [FILE]`](#elasticsearch-index-migrate-migratetemplate-file)
* [`elasticsearch-index-migrate plan [FILE]`](#elasticsearch-index-migrate-plan-file)
* [`elasticsearch-index-migrate plan:esindex [FILE]`](#elasticsearch-index-migrate-planesindex-file)
* [`elasticsearch-index-migrate plan:template [FILE]`](#elasticsearch-index-migrate-plantemplate-file)
* [`elasticsearch-index-migrate recovery [FILE]`](#elasticsearch-index-migrate-recovery-file)
* [`elasticsearch-index-migrate validate [FILE]`](#elasticsearch-index-migrate-validate-file)
* [`elasticsearch-index-migrate validate:esindex [FILE]`](#elasticsearch-index-migrate-validateesindex-file)
* [`elasticsearch-index-migrate validate:template [FILE]`](#elasticsearch-index-migrate-validatetemplate-file)
* [`elasticsearch-index-migrate version`](#elasticsearch-index-migrate-version)

## `elasticsearch-index-migrate baseline [NAME]`

Create a baseline in migration_history if you were running Elasticsearch before the tool was implemented.(´・ω・｀)ｼｮﾎﾞｰﾝ

```
USAGE
  $ elasticsearch-index-migrate baseline [NAME]

ARGUMENTS
  NAME  migration index or template name.

OPTIONS
  -C, --elasticsearch_cloudid=elasticsearch_cloudid    Connect to Elasticsearch with the value set in the
                                                       ELASTICSEARCH_CLOUDID environment variable

  -E, --search_engine=search_engine                    Connect assuming the search engine (Elasticsearch or Opensearch)
                                                       set in the SEARCH_ENGINE environment variable

  -H, --elasticsearch_host=elasticsearch_host          Connect to Elasticsearch with the value set in the
                                                       ELASTICSEARCH_HOST environment variable

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

  -h, --help                                           Show CLI help.

  -i, --index=index                                    migration index name.
                                                       The index flags will be removed in the next version. Please use
                                                       the arguments (name) instead of this flags.

  --version                                            Show CLI version.
```

_See code: [src/app/commands/baseline/index.ts](https://github.com/kmiura-1002/elasticsearch-index-migrate/blob/v1.0.0/src/app/commands/baseline/index.ts)_

## `elasticsearch-index-migrate clean [FILE]`

describe the command here

```
USAGE
  $ elasticsearch-index-migrate clean [FILE]

OPTIONS
  -f, --force
  -h, --help       Show CLI help.
  -n, --name=name  name to print

EXAMPLE
  $ mynewcli hello hello world from ./src/hello.ts!
```

_See code: [src/app/commands/clean/index.ts](https://github.com/kmiura-1002/elasticsearch-index-migrate/blob/v1.0.0/src/app/commands/clean/index.ts)_

## `elasticsearch-index-migrate clean:esindex [FILE]`

describe the command here

```
USAGE
  $ elasticsearch-index-migrate clean:esindex [FILE]

OPTIONS
  -f, --force
  -h, --help       Show CLI help.
  -n, --name=name  name to print

EXAMPLE
  $ mynewcli hello hello world from ./src/hello.ts!
```

_See code: [src/app/commands/clean/esindex.ts](https://github.com/kmiura-1002/elasticsearch-index-migrate/blob/v1.0.0/src/app/commands/clean/esindex.ts)_

## `elasticsearch-index-migrate clean:template [FILE]`

describe the command here

```
USAGE
  $ elasticsearch-index-migrate clean:template [FILE]

OPTIONS
  -f, --force
  -h, --help       Show CLI help.
  -n, --name=name  name to print

EXAMPLE
  $ mynewcli hello hello world from ./src/hello.ts!
```

_See code: [src/app/commands/clean/template.ts](https://github.com/kmiura-1002/elasticsearch-index-migrate/blob/v1.0.0/src/app/commands/clean/template.ts)_

## `elasticsearch-index-migrate help [COMMAND]`

Display help for elasticsearch-index-migrate.

```
USAGE
  $ elasticsearch-index-migrate help [COMMAND]

ARGUMENTS
  COMMAND  Command to show help for.

OPTIONS
  -n, --nested-commands  Include all nested commands in the output.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v5.1.11/src/commands/help.ts)_

## `elasticsearch-index-migrate migrate [FILE]`

describe the command here

```
USAGE
  $ elasticsearch-index-migrate migrate [FILE]

OPTIONS
  -f, --force
  -h, --help       Show CLI help.
  -n, --name=name  name to print

EXAMPLE
  $ mynewcli hello hello world from ./src/hello.ts!
```

_See code: [src/app/commands/migrate/index.ts](https://github.com/kmiura-1002/elasticsearch-index-migrate/blob/v1.0.0/src/app/commands/migrate/index.ts)_

## `elasticsearch-index-migrate migrate:esindex [FILE]`

describe the command here

```
USAGE
  $ elasticsearch-index-migrate migrate:esindex [FILE]

OPTIONS
  -f, --force
  -h, --help       Show CLI help.
  -n, --name=name  name to print

EXAMPLE
  $ mynewcli hello hello world from ./src/hello.ts!
```

_See code: [src/app/commands/migrate/esindex.ts](https://github.com/kmiura-1002/elasticsearch-index-migrate/blob/v1.0.0/src/app/commands/migrate/esindex.ts)_

## `elasticsearch-index-migrate migrate:template [FILE]`

describe the command here

```
USAGE
  $ elasticsearch-index-migrate migrate:template [FILE]

OPTIONS
  -f, --force
  -h, --help       Show CLI help.
  -n, --name=name  name to print

EXAMPLE
  $ mynewcli hello hello world from ./src/hello.ts!
```

_See code: [src/app/commands/migrate/template.ts](https://github.com/kmiura-1002/elasticsearch-index-migrate/blob/v1.0.0/src/app/commands/migrate/template.ts)_

## `elasticsearch-index-migrate plan [FILE]`

describe the command here

```
USAGE
  $ elasticsearch-index-migrate plan [FILE]

OPTIONS
  -C, --elasticsearch_cloudid=elasticsearch_cloudid    Connect to Elasticsearch with the value set in the
                                                       ELASTICSEARCH_CLOUDID environment variable

  -E, --search_engine=search_engine                    Connect assuming the search engine (Elasticsearch or Opensearch)
                                                       set in the SEARCH_ENGINE environment variable

  -H, --elasticsearch_host=elasticsearch_host          Connect to Elasticsearch with the value set in the
                                                       ELASTICSEARCH_HOST environment variable

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

  -f, --force

  -h, --help                                           Show CLI help.

  -n, --name=name                                      name to print

  --version                                            Show CLI version.

EXAMPLE
  $ mynewcli hello hello world from ./src/hello.ts!
```

_See code: [src/app/commands/plan/index.ts](https://github.com/kmiura-1002/elasticsearch-index-migrate/blob/v1.0.0/src/app/commands/plan/index.ts)_

## `elasticsearch-index-migrate plan:esindex [FILE]`

describe the command here

```
USAGE
  $ elasticsearch-index-migrate plan:esindex [FILE]

OPTIONS
  -f, --force
  -h, --help       Show CLI help.
  -n, --name=name  name to print

EXAMPLE
  $ mynewcli hello hello world from ./src/hello.ts!
```

_See code: [src/app/commands/plan/esindex.ts](https://github.com/kmiura-1002/elasticsearch-index-migrate/blob/v1.0.0/src/app/commands/plan/esindex.ts)_

## `elasticsearch-index-migrate plan:template [FILE]`

describe the command here

```
USAGE
  $ elasticsearch-index-migrate plan:template [FILE]

OPTIONS
  -f, --force
  -h, --help       Show CLI help.
  -n, --name=name  name to print

EXAMPLE
  $ mynewcli hello hello world from ./src/hello.ts!
```

_See code: [src/app/commands/plan/template.ts](https://github.com/kmiura-1002/elasticsearch-index-migrate/blob/v1.0.0/src/app/commands/plan/template.ts)_

## `elasticsearch-index-migrate recovery [FILE]`

describe the command here

```
USAGE
  $ elasticsearch-index-migrate recovery [FILE]

OPTIONS
  -f, --force
  -h, --help       Show CLI help.
  -n, --name=name  name to print

EXAMPLE
  $ mynewcli hello hello world from ./src/hello.ts!
```

_See code: [src/app/commands/recovery.ts](https://github.com/kmiura-1002/elasticsearch-index-migrate/blob/v1.0.0/src/app/commands/recovery.ts)_

## `elasticsearch-index-migrate validate [FILE]`

describe the command here

```
USAGE
  $ elasticsearch-index-migrate validate [FILE]

OPTIONS
  -f, --force
  -h, --help       Show CLI help.
  -n, --name=name  name to print

EXAMPLE
  $ mynewcli hello hello world from ./src/hello.ts!
```

_See code: [src/app/commands/validate/index.ts](https://github.com/kmiura-1002/elasticsearch-index-migrate/blob/v1.0.0/src/app/commands/validate/index.ts)_

## `elasticsearch-index-migrate validate:esindex [FILE]`

describe the command here

```
USAGE
  $ elasticsearch-index-migrate validate:esindex [FILE]

OPTIONS
  -f, --force
  -h, --help       Show CLI help.
  -n, --name=name  name to print

EXAMPLE
  $ mynewcli hello hello world from ./src/hello.ts!
```

_See code: [src/app/commands/validate/esindex.ts](https://github.com/kmiura-1002/elasticsearch-index-migrate/blob/v1.0.0/src/app/commands/validate/esindex.ts)_

## `elasticsearch-index-migrate validate:template [FILE]`

describe the command here

```
USAGE
  $ elasticsearch-index-migrate validate:template [FILE]

OPTIONS
  -f, --force
  -h, --help       Show CLI help.
  -n, --name=name  name to print

EXAMPLE
  $ mynewcli hello hello world from ./src/hello.ts!
```

_See code: [src/app/commands/validate/template.ts](https://github.com/kmiura-1002/elasticsearch-index-migrate/blob/v1.0.0/src/app/commands/validate/template.ts)_

## `elasticsearch-index-migrate version`

```
USAGE
  $ elasticsearch-index-migrate version
```

_See code: [@oclif/plugin-version](https://github.com/oclif/plugin-version/blob/v1.0.4/src/commands/version.ts)_
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
