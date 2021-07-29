import { Command, flags } from '@oclif/command';
import axios from 'axios';
import * as chalk from 'chalk';
import { IApiWrapper } from '../interface/api';
import { autoPrompt } from '../utils/prompt';

export default class ListRelease extends Command {
  static description = 'Login authentication, and cache the API Token';

  static examples = [
    `$ widget-cli auth [apiToken] --host [host]
Succeed!
`,
  ];

  static flags = {
    host: flags.string({ char: 'h', description: 'Specifies the host of the server, such as https://vika.cn' }),
    token: flags.string({ char: 't', description: 'Your API Token' }),
    global: flags.boolean({ char: 'g', description: 'Specify global widget package' }),
  };

  static args = [
    { name: 'packageId', description: 'The widget package you want to unpublish' },
  ];

  async getPackageRelease({ host, token, packageId }: {host: string, token: string, packageId: string}) {
    const result = await axios.get<IApiWrapper>(`/widget/package/release/history/${packageId}`, {
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

  async getWidgetPackage({ host, token, packageId }: {host: string, token: string, packageId: string}) {
    const result = await axios.get<IApiWrapper>(`/widget/package/${packageId}`, {
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
    const { host, token, packageId } = await autoPrompt(this.parse(ListRelease));

    const widgetPackage = await this.getWidgetPackage({ host, token, packageId });

    this.log(chalk.yellowBright('=== Package Details ==='));
    Object.entries(widgetPackage.data).forEach(([key, value]) => {
      this.log((key+':').padEnd(15) + value);
    });

    this.log();
    this.log(chalk.yellowBright('=== Package Release Details ==='));
    const packageRelease = await this.getPackageRelease({ host, token, packageId });

    Object.values<{[key: string]: string}>(packageRelease.data).forEach(item => {
      this.log(chalk.yellow(`Version ${item.version}`));
      Object.entries(item).forEach(([key, value]) => {
        this.log((key+':').padEnd(20) + value);
      });
    });
  }
}
