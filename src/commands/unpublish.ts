import { Command, flags } from '@oclif/command';
import axios from 'axios';
import cli from 'cli-ux';
import * as chalk from 'chalk';
import { IApiWrapper } from '../interface/api';
import { hostPrompt, tokenPrompt } from '../utils/prompt';
import { getPrivateConfig, getWidgetConfig } from '../utils/project';

export default class Unpublish extends Command {
  static description = 'Login authentication, and cache the API Token';

  static examples = [
    `$ widget-cli auth [apiToken] --host [host]
Succeed!
`,
  ];

  static flags = {
    host: flags.string({ char: 'h', description: 'Specifies the host of the server, such as https://vika.cn' }),
    token: flags.string({ name: 'token', description: 'Your API Token' }),
  };

  static args = [
    { name: 'packageId', description: 'The widget package you want to unpublish' },
  ];

  async unpublishWidget({ host, token, packageId }: {host: string, token: string, packageId: string}) {
    const result = await axios.post<IApiWrapper>('/widget/package/unpublish', {
      packageId,
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
    let { args: { packageId, globalPackageId }, flags: { host, token }} = this.parse(Unpublish);

    if (!packageId && !globalPackageId) {
      const config = getPrivateConfig();
      token = config.token!;
      host = config.host!;
      packageId = getWidgetConfig().packageId;
    } else {
      host = await hostPrompt();
      token = await tokenPrompt();
      if (globalPackageId) {
        packageId = globalPackageId;
      }
    }

    const widgetPackage = await this.getWidgetPackage({ host, token, packageId });

    this.log(chalk.yellowBright('=== Package Details ==='));
    Object.entries(widgetPackage.data).forEach(([key, value]) => {
      this.log(key.padEnd(15) + value);
    });

    const sure = await cli.confirm(`Are you sure to unpublish ${widgetPackage.data.name} (Y/n)`);
    if (!sure) {
      this.log('canceled!');
      return;
    }

    await this.unpublishWidget({ host, token, packageId });

    this.log(chalk.greenBright('Unpublish succeed!'));
  }
}
