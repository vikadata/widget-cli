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
* [`widget-cli hello [FILE]`](#widget-cli-hello-file)
* [`widget-cli help [COMMAND]`](#widget-cli-help-command)

## `widget-cli hello [FILE]`

describe the command here

```
USAGE
  $ widget-cli hello [FILE]

OPTIONS
  -f, --force
  -h, --help       show CLI help
  -n, --name=name  name to print

EXAMPLE
  $ widget-cli hello
  hello world from ./src/hello.ts!
```

_See code: [src/commands/hello.ts](https://github.com/vikadata/widget-cli/blob/v0.1.0/src/commands/hello.ts)_

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
<!-- commandsstop -->
