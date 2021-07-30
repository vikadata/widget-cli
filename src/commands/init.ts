import { Command, flags } from '@oclif/command';
import axios from 'axios';
import cli from 'cli-ux';
import { exec } from 'child_process';
import * as path from 'path';
import * as fse from 'fs-extra';
import * as chalk from 'chalk';
import Config from '../config';
import { IApiWrapper } from '../interface/api';
import { hostPrompt, tokenPrompt } from '../utils/prompt';
import { IWidgetConfig } from '../interface/widget_config';
import { kebab2camel } from '../utils/string';
import { setPackageJson, updatePrivateConfig } from '../utils/project';
import { PackageType, ReleaseType } from '../enum';

const templateDir = path.resolve(__dirname, '../../template/developer_template');

export default class Init extends Command {
  static description = 'create a widget project and register it in your space';

  static examples = [
    `$ widget-cli auth
your widget: my-widget is successfully created, cd my-widget/ check it out!
`,
  ];

  static flags = {
    host: flags.string({ char: 'h', description: 'Specifies the host of the server, such as https://vika.cn' }),
    official: flags.boolean({ description: 'With official capacity', hidden: true }),
    name: flags.string({ char: 'c', description: 'Name your widget and project' }),
    authorName: flags.string({ description: 'Author name' }),
    authorLink: flags.string({ description: 'Author website' }),
    authorEmail: flags.string({ description: 'Author Email' }),
  };

  static args = [
    { name: 'token', description: 'Your API Token' },
    { name: 'spaceId', description: 'In which space to put the widget on' },
  ];

  exec(cmd: string, destDir: string) {
    return new Promise((resolve, reject) => {
      exec(cmd, { cwd: destDir }, (error, stdout, stderr) => {
        if (error) {
          reject(error);
        }

        if (stderr) {
          console.error(stderr);
          return;
        }
  
        this.log(stdout);
        resolve(undefined);
      });
    });
  }

  async gitInit(destDir: string) {
    this.log(chalk.yellowBright('git init'));
    await this.exec('git init', destDir);
    this.log(chalk.yellowBright('git add .'));
    await this.exec('git add .', destDir);
    this.log(chalk.yellowBright('git commit'));
    await this.exec('git commit -m \'initial commit\'', destDir);
  }

  async install(destDir: string) {
    this.log(chalk.yellowBright('yarn install'));

    await this.exec('yarn install', destDir);
  }

  async createWidgetPackage(
    { host, token, name, spaceId, packageType, releaseType, authorName, authorLink, authorEmail }:
    {
      host: string; token: string; packageId?: string; name: string;
      spaceId: string; packageType: PackageType; releaseType: ReleaseType;
      authorName?: string; authorLink?: string; authorEmail?: string;
    }
  ) {
    const data = {
      spaceId,
      packageType,
      releaseType,
      authorName,
      authorLink,
      authorEmail,
      name: JSON.stringify({
        'en-US': name,
        'zh-CN': name,
      }),
    };
    const result = await axios.post<IApiWrapper<{packageId: string}>>('/widget/package/create', data, {
      baseURL: `${host}/api/v1`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (result.data.success) {
      this.log('Successful create widgetPackage from server');
    } else {
      this.error(result.data.message, { code: String(result.data.code) });
    }
    return result.data.data;
  }

  async run() {
    let { args: { token, spaceId }, flags: { host, official, name, authorName, authorLink, authorEmail }} = this.parse(Init);
    if (official) {
      this.log(chalk.yellowBright('Your are creating a official widget project!'));
    }

    token = await tokenPrompt(token);

    host = await hostPrompt(host);

    if (!spaceId) {
      spaceId = await cli.prompt('Your target spaceId', { required: true });
    }

    if (!name) {
      name = await cli.prompt('Name your widget and project (no white space in name)', { default: 'my-widget', required: true });
      if (!/^[a-z0-9-_]*$/i.test(name!)) {
        this.error('name should only contain alphabet/-/_');
      }
    }

    if (!authorName) {
      authorName = await cli.prompt('Author name');
    }

    if (!authorLink) {
      authorLink = await cli.prompt('Author website');
    }

    if (!authorEmail) {
      authorEmail = await cli.prompt('Author Email');
    }

    const rootDir = path.resolve(process.cwd(), `./${name}`);

    let result;
    try {
      result = await this.createWidgetPackage({
        token, spaceId, host: host!, name: name!, authorName, authorEmail, authorLink,
        releaseType: ReleaseType.Space,
        packageType: official ? PackageType.Official : PackageType.Custom,
      });
    } catch (error) {
      // remove destDir when fail to init widget package
      fse.removeSync(rootDir);
      throw error;
    }

    fse.copySync(templateDir, rootDir);

    const widgetConfig = require(path.join(rootDir, Config.widgetConfigFileName)) as IWidgetConfig;
    const nameCamelized = kebab2camel(name!);
    const newWidgetConfig = {
      ...widgetConfig,
      packageId: result.packageId,
      spaceId,
      name: { 'zh-CN': nameCamelized, 'en-US': nameCamelized },
      authorName,
      authorLink,
      authorEmail,
      description: { 'zh-CN': `${nameCamelized} 的描述`, 'en-US': `${nameCamelized} description` },
    };
    fse.writeFileSync(path.join(rootDir, Config.widgetConfigFileName), JSON.stringify(newWidgetConfig, null, 2));

    updatePrivateConfig({ host, token }, rootDir);

    setPackageJson('name', name!, rootDir);

    try {
      await this.gitInit(rootDir);
      // await this.install(rootDir);
    } catch(error) {

    } finally {
      this.log(chalk.greenBright(`your widget: ${name} is successfully created, cd ./${name} go check!`));
    }
  }
}
