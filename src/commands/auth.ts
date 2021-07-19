import {Command, flags} from '@oclif/command'
import * as path from 'path'
import * as fse from 'fs-extra'
import axios from 'axios'
import * as YAML from 'yaml'
import {IApiWrapper} from '../interface/api'
import {hostPrompt, tokenPrompt} from '../utils/prompt'
import {findWidgetRootDir} from '../utils/root_dir'
import Config from '../config'

export default class Auth extends Command {
  static description = '使用 API Token 登录到一个空间站下'

  static examples = [
    `$ widget-cli auth [apiToken] --host [host]
登录成功！
`,
  ]

  static flags = {
    host: flags.string({char: 'h', description: 'Specifies the host of the server, such as https://vika.cn'}),
  }

  static args = [
    {name: 'token', description: 'Your API Token'},
  ]

  async authorization(host: string, token: string, packageId?: string) {
    const result = await axios.post<IApiWrapper>('/widget/package/auth', {
      packageId,
    }, {
      baseURL: `${host}/api/v1`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!result.data.success) {
      this.error(result.data.message, {code: String(result.data.code), exit: 1})
    }
  }

  updateYamlFile(rootDir: string, token: string, host: string) {
    const yamlPath = path.resolve(rootDir, Config.widgetYamlFileName)
    let file: string | null = null
    try {
      // file not exist will throw an error
      file = fse.readFileSync(yamlPath, 'utf8')
    } catch (error) {
    }

    const yaml = file ? YAML.parse(file) : {}

    yaml.token = token
    yaml.host = host

    const fileToSave = YAML.stringify(yaml)
    fse.outputFileSync(path.resolve(rootDir, Config.widgetYamlFileName), fileToSave)
  }

  async run() {
    let {args: {token}, flags: {host}} = this.parse(Auth)

    host = await hostPrompt(host)
    token = await tokenPrompt(token)

    const rootDir = findWidgetRootDir()

    await this.authorization(host, token)

    this.updateYamlFile(rootDir, host, token)

    this.log('Authorize succeed!')
  }
}
