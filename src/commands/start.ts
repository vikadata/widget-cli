/* eslint-disable no-console */
import {Command, flags} from '@oclif/command'
import * as chalk  from 'chalk'
import * as webpack from 'webpack'
import * as path from 'path'
import * as express from 'express'
import {getWebpackConfig} from '../webpack.config'
import {findWidgetRootDir} from '../utils/root_dir'
import Config from '../config'

export default class Start extends Command {
  static description = 'start current widget project in develop mode'

  static examples = [
    `$ widget-cli start
Compiling...
`,
  ]

  static flags = {
    port: flags.string({char: 'p', description: 'Specifies the port of the local server', default: '9000'}),
    debug: flags.boolean({description: 'show debug information for cli it self'}),
  }

  startCompile(config: webpack.Configuration) {
    webpack(config, (err: any, stats: any) => {
      if (err) {
        if ((err as any).details!) {
          this.error((err as any).details)
        }
        this.error(err.stack || err)
      }

      if (!stats) {
        return
      }

      const info = stats.toJson()

      if (!info) {
        return
      }

      if (stats.hasErrors()) {
        info.errors!.forEach((e: any) => {
          console.error(e.message)
        })
      }

      if (stats.hasWarnings()) {
        info.warnings!.forEach((e: any) => {
          console.warn(e.message)
        })
      }

      this.log(info.logging)
    })
  }

  hostCompliedFile(port: string, filePath: string) {
    const app = express()
    app.listen(port)
    app.use(express.static(path.join(filePath)))
  }

  async run() {
    const {flags: {port, debug}} = this.parse(Start)
    const projectDir = findWidgetRootDir()
    const widgetConfig = require(path.join(projectDir, Config.widgetConfigFileName))

    const config = getWebpackConfig({dir: projectDir, config: widgetConfig, onSucceed: () => {
      this.log(chalk.cyanBright('************************'))
      this.log(chalk.yellowBright('复制以下地址粘贴到小组件容器中：'))
      this.log(chalk.yellowBright(`http://localhost:${port}/widget_bundle.js`))
      this.log(chalk.cyanBright('************************'))
    }})

    config.watch = true

    if (debug) {
      this.log('webpackConfig: ', JSON.stringify(config, null, 2))
    }

    this.startCompile(config)
    this.hostCompliedFile(port, config.output!.path!)
  }
}
