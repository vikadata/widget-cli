import { Command, flags } from '@oclif/command';
import axios from 'axios';
import cli from 'cli-ux';
import * as AdmZip from 'adm-zip';
import * as os from 'os';
import * as mv from 'mv';
import * as path from 'path';
import * as fse from 'fs-extra';
import * as chalk from 'chalk';
import Config from '../config';
import { hostPrompt, tokenPrompt } from '../utils/prompt';
import { kebab2camel } from '../utils/string';
import { getWidgetConfig, setPackageJson, updatePrivateConfig } from '../utils/project';
import { asyncExec } from '../utils/exec';

export default class Init extends Command {
  static description = 'Create a widget project and register it in your space';

  static examples = [
    `$ widget-cli init
your widget: my-widget is successfully created, cd my-widget/ check it out!
`,
  ];

  static flags = {
    host: flags.string({ char: 'h', description: 'Specifies the host of the server, such as https://apitable.com' }),
    name: flags.string({ char: 'c', description: 'Name your widget and project' }),
    official: flags.boolean({ description: 'With official capacity', hidden: true }),
    template: flags.string({ char: 'u', description: 'The template code zip from apitable or github' }),
    packageId: flags.string({ char: 'p', description: 'The widget package id' }),
    token: flags.string({ char: 't', description: 'Your API Token' }),
    spaceId: flags.string({ char: 's', description: 'In which space to put the widget on' }),
  };

  async gitInit(destDir: string) {
    this.log(chalk.yellowBright('git init'));
    await asyncExec('git init', destDir);
    this.log(chalk.yellowBright('git add .'));
    await asyncExec('git add .', destDir);
    this.log(chalk.yellowBright('git commit'));
    await asyncExec('git commit -m \'initial commit\'', destDir);
  }

  async install(destDir: string) {
    this.log(chalk.yellowBright('yarn install'));

    await asyncExec('yarn install', destDir);
  }

  async fetchTemplate(url: string): Promise<Buffer> {
    const { data } = await axios.get(url, {
      responseType: 'arraybuffer',
    });
    return data;
  }

  async extractTemplate(url: string, dir: string) {
    const zipFileBuffer = await this.fetchTemplate(url);
    const zip = new AdmZip(zipFileBuffer);
    const entries = zip.getEntries();
    const firstDir = entries.find(entry => entry.isDirectory)!;
    const tempDir = path.join(os.tmpdir(), firstDir.entryName);
    zip.extractAllTo(os.tmpdir() , true);
    await new Promise((resolve, reject) => {
      mv(tempDir, dir, (err) => {
        if (err) {
          reject(err);
        }
        resolve(undefined);
      });
    });
    fse.removeSync(tempDir);
  }

  generateRootDir(name: string | undefined) {
    return path.resolve(process.cwd(), `./${name}`);
  }

  async run() {
    let { flags: { token, spaceId, packageId, host, official, template, name }} = this.parse(Init);
    if (official) {
      this.log(chalk.yellowBright('Your are creating a official widget project!'));
    }

    token = await tokenPrompt(token);

    host = await hostPrompt(host);

    if (!spaceId) {
      spaceId = await cli.prompt('Your target spaceId', { required: true });
    }

    if (!packageId) {
      packageId = await cli.prompt('Your target packageId', { required: true });
    }

    if (!template) {
      template = await cli.prompt('Your target template', { required: true });
    }

    if (!name) {
      name = await cli.prompt('Name your widget and project (no white space in name)', { default: 'my-widget', required: true });
      if (!/^[a-z0-9-_]*$/i.test(name!)) {
        this.error('name should only contain alphabet/-/_');
      }
    }

    const rootDir = this.generateRootDir(name);

    cli.action.start(`fetching template from ${template}`);
    await this.extractTemplate(template!, rootDir);
    cli.action.stop();

    const widgetConfig = getWidgetConfig(rootDir);
    const nameCamelized = kebab2camel(name!);
    const newWidgetConfig = {
      ...widgetConfig,
      authorEmail: undefined,
      authorLink: undefined,
      authorName: undefined,
      globalPackageId: undefined,
      packageId,
      spaceId,
      name: { 'en-US': nameCamelized },
      description: { 'en-US': `${nameCamelized} description` },
    };
    fse.writeFileSync(path.join(rootDir, Config.widgetConfigFileName), JSON.stringify(newWidgetConfig, null, 2));

    updatePrivateConfig({ host, token }, rootDir);

    setPackageJson({ version: '0.0.0' }, rootDir);

    try {
      await this.gitInit(rootDir);
      // await this.install(rootDir);
    } catch {
      this.error('Error initializing widget!');
    } finally {
      this.log(chalk.greenBright(`your widget: ${name} is successfully created, cd ./${name} go check!`));
    }
  }
}
