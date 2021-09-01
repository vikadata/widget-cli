import { Command, flags } from '@oclif/command';
import axios from 'axios';
import * as chalk from 'chalk';
import { IApiWrapper } from '../interface/api';
import { updatePrivateConfig } from '../utils/project';
import { cli } from 'cli-ux';

export default class Auth extends Command {
  static description = 'Login authentication, and cache the API Token';

  static examples = [
    `$ widget-cli auth [apiToken] --host [host]
Succeed!
`,
  ];

  static flags = {
    host: flags.string({ char: 'h', description: 'Specifies the host of the server, such as https://vika.cn' }),
  };

  static args = [
    { name: 'token', description: 'Your API Token' },
  ];

  async authorization(host: string, token: string, packageId?: string) {
    const result = await axios.post<IApiWrapper>('/widget/package/auth', {
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
  }

  async run() {
    let { args: { token }, flags: { host }} = this.parse(Auth);

    if (!host) {
      host = await cli.prompt('Host of the server', { default: 'https://vika.cn' })!;
    }

    if (!token) {
      token = await cli.prompt('Your API Token', { required: true, type: 'mask' })!;
    }

    await this.authorization(host!, token);

    updatePrivateConfig({ host, token });

    this.log(chalk.greenBright('Authorize succeed!'));
  }
}
