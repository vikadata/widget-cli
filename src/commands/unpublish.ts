import { Command, flags } from '@oclif/command';
import axios from 'axios';
import cli from 'cli-ux';
import * as chalk from 'chalk';
import { IApiWrapper } from '../interface/api';
import { autoPrompt } from '../utils/prompt';

export default class Unpublish extends Command {
  static description = 'Unpublish your widget package';

  static examples = [
    `$ widget-cli unpublish
Succeed!
`,
  ];

  static flags = {
    host: flags.string({ char: 'h', description: 'Specifies the host of the server, such as https://vika.cn' }),
    global: flags.boolean({ char: 'g', description: 'Specify global widget package' }),
    token: flags.string({ char: 't', description: 'Your API Token' }),
    noConfirm: flags.boolean({ description: 'Do not show confirm' }),
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
    const parsed = this.parse(Unpublish);
    const noConfirm = parsed.flags.noConfirm;
    const { host, token, packageId } = await autoPrompt(parsed);

    const widgetPackage = await this.getWidgetPackage({ host, token, packageId });

    this.log(chalk.yellowBright('=== Package Details ==='));
    Object.entries(widgetPackage.data).forEach(([key, value]) => {
      this.log(key.padEnd(15) + value);
    });

    const sure = noConfirm ? true : await cli.confirm(`Are you sure to unpublish ${widgetPackage.data.name} (Y/n)`);
    if (!sure) {
      this.log('canceled!');
      return;
    }

    await this.unpublishWidget({ host, token, packageId });

    this.log(chalk.greenBright('Unpublish succeed!'));
  }
}
