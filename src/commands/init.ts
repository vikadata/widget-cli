import {Command, flags} from '@oclif/command'
import * as path from 'path'
import cli from 'cli-ux'
import * as fse from 'fs-extra'
import {exec} from 'child_process'

import axios from 'axios'
import {IApiWrapper} from '../interface/api'
import {generateRandomId} from '../utils/id'
import {hostPrompt, tokenPrompt} from '../utils/prompt'

const templateDir = path.resolve(__dirname, '../template/developer_template')

enum PackageType {
  Custom = 0,
  Official = 1,
}

enum ReleaseType {
  Space = 0,
  Global = 1,
}

export default class Init extends Command {
  static description = 'Create a widget project and register it in your space'

  static examples = [
    `$ widget-cli auth
your widget: my-widget is successfully created, cd my-widget/ check it out!
`,
  ]

  static flags = {
    host: flags.string({char: 'h', description: 'Specifies the host of the server, such as https://vika.cn'}),
    official: flags.boolean({description: 'With official capacity', hidden: true}),
    packageId: flags.string({description: 'widgetPackageId, Start with "wpk" followed by 10 alphanumeric or numbers', hidden: true}),
    name: flags.string({char: 'c', description: 'Name your widget and project'}),
    authorName: flags.string({description: 'Author name'}),
    authorLink: flags.string({description: 'Author website'}),
    authorEmail: flags.string({description: 'Author Email'}),
  }

  static args = [
    {name: 'token', description: 'Your API Token'},
    {name: 'spaceId', description: 'In which space to put the widget on'},
  ]

  exec(cmd: string, destDir: string) {
    exec(cmd, {cwd: destDir}, (error, stdout, stderr) => {
      if (error) {
        this.error(error.message)
      }
      if (stderr) {
        this.error(stderr)
      }

      this.log(stdout)
    })
  }

  gitInit(destDir: string) {
    this.log('run git init...')
    this.exec('git init', destDir)
    this.exec('git add .', destDir)
    this.exec('git commit -m \'initial commit\'', destDir)
  }

  install(destDir: string) {
    this.log('run yarn install...')
    this.exec('yarn', destDir)
  }

  async createWidgetPackage(
    {host, token, packageId, name, spaceId, packageType, releaseType, authorName, authorLink, authorEmail}:
    {
      host: string; token: string; packageId?: string; name: string;
      spaceId: string; packageType: PackageType; releaseType: ReleaseType;
      authorName?: string; authorLink?: string; authorEmail?: string;
    }
  ) {
    const result = await axios.post<IApiWrapper>('/widget/package/create', {
      spaceId,
      packageId,
      packageType,
      releaseType,
      authorName,
      authorLink,
      authorEmail,
      name: {
        'en-US': name,
        'zh-CN': name,
      },
    }, {
      baseURL: `${host}/api/v1`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (result.data.success) {
      this.log('Successful create widgetPackage from server')
    } else {
      this.error(result.data.message, {code: String(result.data.code), exit: 1})
    }
  }

  async run() {
    let {args: {token, spaceId}, flags: {host, official, packageId, name, authorName, authorLink, authorEmail}} = this.parse(Init)
    if (official) {
      this.warn('Your are creating a official widget project!')
      if (!packageId) {
        const randomId = generateRandomId('wpk', 10)
        packageId = await cli.prompt('widgetPackageId, Start with "wpk" followed by 10 alphanumeric or numbers', {default: randomId})
      }
    }

    token = await tokenPrompt(token)

    host = await hostPrompt(host)

    if (!spaceId) {
      spaceId = await cli.prompt('Your target spaceId', {required: true})
    }

    if (!name) {
      name = await cli.prompt('Name your widget and project', {default: 'my-widget'})
    }

    if (!authorName) {
      authorName = await cli.prompt('Author name')
    }

    if (!authorLink) {
      authorLink = await cli.prompt('Author website')
    }

    if (!authorEmail) {
      authorEmail = await cli.prompt('Author Email')
    }

    const destDir = path.resolve(process.cwd(), `./${name}`)

    fse.copySync(templateDir, destDir)

    try {
      await this.createWidgetPackage({
        token, spaceId, host: host!, name: name!, authorName, authorEmail, authorLink,
        releaseType: ReleaseType.Space,
        packageType: official ? PackageType.Official : PackageType.Custom,
      })
    } catch (error) {
      // remove destDir when fail to init widget package
      fse.removeSync(destDir)
      throw error
    }

    // this.gitInit(destDir);
    // this.install(destDir);
    this.log(`your widget: ${name} is successfully created, cd ./${name} go check!`)
  }
}
