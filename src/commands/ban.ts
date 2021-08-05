import { Command, flags } from '@oclif/command';
import cli from 'cli-ux';
import axios from 'axios';
import * as chalk from 'chalk';
import { IApiWrapper } from '../interface/api';
import { autoPrompt } from '../utils/prompt';

export default class Ban extends Command {
  // static description = 'ban widget';

  static hidden: true;

  static flags = {
    host: flags.string({ char: 'h', description: 'Specifies the host of the server, such as https://vika.cn' }),
    token: flags.string({ char: 't', description: 'Your API Token' }),
    unban: flags.boolean({ description: 'Unban package' }),
    global: flags.boolean({ char: 'g', description: 'Specify global widget package' }),
  };

  static args = [
    { name: 'packageId', description: 'The widget package you want to ban' },
  ];

  async banRelease({ host, token, packageId, unban }: {host: string, token: string, packageId: string, unban: boolean}) {
    const result = await axios.post<IApiWrapper>('/widget/package/ban', {
      packageId,
      unban: Boolean(unban),
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
    const parsed = this.parse(Ban);
    let { flags: { unban }} = parsed;
    const { host, token, packageId } = await autoPrompt(parsed);

    this.log(chalk.yellowBright(`Ban widget package: ${packageId}`));

    const sure = await cli.confirm('Are you sure? Y/n');

    if (!sure) {
      this.log('canceled');
      return;
    }

    const data = await this.banRelease({ host, token, packageId, unban });

    this.log(chalk.greenBright(data.message));
  }
}
