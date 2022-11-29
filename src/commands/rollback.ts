import { Command, flags } from '@oclif/command';
import cli from 'cli-ux';
import axios from 'axios';
import * as chalk from 'chalk';
import { IApiWrapper } from '../interface/api';
import { autoPrompt } from '../utils/prompt';

export default class Rollback extends Command {
  static description = 'Rollback the widget package to the specified version';

  static examples = [
    `$ widget-cli rollback [packageId] [version] --host [host] --token [token]
Succeed!
`,
  ];

  static flags = {
    host: flags.string({ char: 'h', description: 'Specifies the host of the server, such as https://apitable.com' }),
    token: flags.string({ char: 't', description: 'Your API Token' }),
    global: flags.boolean({ char: 'g', description: 'Specify global widget package' }),
  };

  static args = [
    { name: 'packageId', description: 'The widget package you want to rollback' },
    { name: 'version', description: 'The version of the widget package you want to rollback' },
  ];

  async rollbackRelease({ host, token, packageId, version }: {host: string, token: string, packageId: string, version: string}) {
    const result = await axios.post<IApiWrapper>('/widget/package/rollback', {
      packageId,
      version,
    }, {
      baseURL: `${host}/api/v1`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!result.data.success) {
      this.error(result.data.message, { code: String(result.data.code), exit: 1 });
    }
    return result.data;
  }

  async run() {
    const parsed = this.parse(Rollback);
    let { args: { version }} = parsed;
    const { host, token, packageId } = await autoPrompt(parsed);

    if (!version) {
      version = await cli.prompt('The version of the widget package you want to rollback', { required: true });
    }

    this.log(chalk.yellowBright(`Rollback version to ${version}`));
    const data = await this.rollbackRelease({ host, token, packageId, version });

    this.log(chalk.greenBright(data.message));
  }
}
