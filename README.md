@vikadata/widget-cli
====================

help you build awesome vika widget

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/@vikadata/widget-cli.svg)](https://npmjs.org/package/@vikadata/widget-cli)
[![Downloads/week](https://img.shields.io/npm/dw/@vikadata/widget-cli.svg)](https://npmjs.org/package/@vikadata/widget-cli)
[![License](https://img.shields.io/npm/l/@vikadata/widget-cli.svg)](https://github.com/vikadata/widget-cli/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g @vikadata/widget-cli
$ widget-cli COMMAND
running command...
$ widget-cli (-v|--version|version)
@vikadata/widget-cli/0.1.0 darwin-x64 node-v14.16.0
$ widget-cli --help [COMMAND]
USAGE
  $ widget-cli COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`widget-cli auth [TOKEN]`](#widget-cli-auth-token)
* [`widget-cli ban [PACKAGEID]`](#widget-cli-ban-packageid)
* [`widget-cli help [COMMAND]`](#widget-cli-help-command)
* [`widget-cli init [TOKEN] [SPACEID]`](#widget-cli-init-token-spaceid)
* [`widget-cli list-release [PACKAGEID]`](#widget-cli-list-release-packageid)
* [`widget-cli release`](#widget-cli-release)
* [`widget-cli rollback [PACKAGEID] [VERSION]`](#widget-cli-rollback-packageid-version)
* [`widget-cli start`](#widget-cli-start)
* [`widget-cli unpublish [PACKAGEID]`](#widget-cli-unpublish-packageid)

## `widget-cli auth [TOKEN]`

Login authentication, and cache the API Token

```
USAGE
  $ widget-cli auth [TOKEN]

ARGUMENTS
  TOKEN  Your API Token

OPTIONS
  -h, --host=host  Specifies the host of the server, such as https://vika.cn

EXAMPLE
  $ widget-cli auth [apiToken] --host [host]
  Succeed!
```

_See code: [src/commands/auth.ts](https://github.com/vikadata/widget-cli/blob/v0.1.0/src/commands/auth.ts)_

## `widget-cli ban [PACKAGEID]`

```
USAGE
  $ widget-cli ban [PACKAGEID]

ARGUMENTS
  PACKAGEID  The widget package you want to ban

OPTIONS
  -g, --global       Specify global widget package
  -h, --host=host    Specifies the host of the server, such as https://vika.cn
  -t, --token=token  Your API Token
  --unban            Unban package
```

_See code: [src/commands/ban.ts](https://github.com/vikadata/widget-cli/blob/v0.1.0/src/commands/ban.ts)_

## `widget-cli help [COMMAND]`

display help for widget-cli

```
USAGE
  $ widget-cli help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.2.2/src/commands/help.ts)_

## `widget-cli init [TOKEN] [SPACEID]`

Create a widget project and register it in your space

```
USAGE
  $ widget-cli init [TOKEN] [SPACEID]

ARGUMENTS
  TOKEN    Your API Token
  SPACEID  In which space to put the widget on

OPTIONS
  -c, --name=name            Name your widget and project
  -h, --host=host            Specifies the host of the server, such as https://vika.cn
  --authorEmail=authorEmail  Author Email
  --authorLink=authorLink    Author website
  --authorName=authorName    Author name

EXAMPLE
  $ widget-cli auth
  your widget: my-widget is successfully created, cd my-widget/ check it out!
```

_See code: [src/commands/init.ts](https://github.com/vikadata/widget-cli/blob/v0.1.0/src/commands/init.ts)_

## `widget-cli list-release [PACKAGEID]`

List all version information for your widget package release

```
USAGE
  $ widget-cli list-release [PACKAGEID]

ARGUMENTS
  PACKAGEID  The widget package you want to unpublish

OPTIONS
  -g, --global       Specify global widget package
  -h, --host=host    Specifies the host of the server, such as https://vika.cn
  -t, --token=token  Your API Token

EXAMPLE
  $ widget-cli list-release [packageId]
  Succeed!
```

_See code: [src/commands/list-release.ts](https://github.com/vikadata/widget-cli/blob/v0.1.0/src/commands/list-release.ts)_

## `widget-cli release`

Release your widget package

```
USAGE
  $ widget-cli release

OPTIONS
  -g, --global           Release this widget package to global
  -v, --version=version  Specifies the version of the project

EXAMPLE
  $ widget-cli release
  Succeed!
```

_See code: [src/commands/release.ts](https://github.com/vikadata/widget-cli/blob/v0.1.0/src/commands/release.ts)_

## `widget-cli rollback [PACKAGEID] [VERSION]`

Rollback the widget package to the specified version

```
USAGE
  $ widget-cli rollback [PACKAGEID] [VERSION]

ARGUMENTS
  PACKAGEID  The widget package you want to rollback
  VERSION    The version of the widget package you want to rollback

OPTIONS
  -g, --global       Specify global widget package
  -h, --host=host    Specifies the host of the server, such as https://vika.cn
  -t, --token=token  Your API Token

EXAMPLE
  $ widget-cli rollback [packageId] [version] --host [host] --token [token]
  Succeed!
```

_See code: [src/commands/rollback.ts](https://github.com/vikadata/widget-cli/blob/v0.1.0/src/commands/rollback.ts)_

## `widget-cli start`

Start current widget project in develop mode

```
USAGE
  $ widget-cli start

OPTIONS
  -o, --protocol=protocol  [default: https] Specifies the protocol of the local server
  -p, --port=port          [default: 9000] Specifies the port of the local server
  --debug                  Show debug information for cli it self

EXAMPLE
  $ widget-cli start
  Compiling...
```

_See code: [src/commands/start.ts](https://github.com/vikadata/widget-cli/blob/v0.1.0/src/commands/start.ts)_

## `widget-cli unpublish [PACKAGEID]`

Unpublish your widget package

```
USAGE
  $ widget-cli unpublish [PACKAGEID]

ARGUMENTS
  PACKAGEID  The widget package you want to unpublish

OPTIONS
  -g, --global       Specify global widget package
  -h, --host=host    Specifies the host of the server, such as https://vika.cn
  -t, --token=token  Your API Token

EXAMPLE
  $ widget-cli unpublish
  Succeed!
```

_See code: [src/commands/unpublish.ts](https://github.com/vikadata/widget-cli/blob/v0.1.0/src/commands/unpublish.ts)_
<!-- commandsstop -->
