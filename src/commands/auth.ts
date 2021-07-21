import { Command, flags } from '@oclif/command';
import axios from 'axios';
import { IApiWrapper } from '../interface/api';
import { hostPrompt, tokenPrompt } from '../utils/prompt';
import { updatePrivateConfig } from '../utils/project';

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

    host = await hostPrompt(host);
    token = await tokenPrompt(token);

    await this.authorization(host, token);

    updatePrivateConfig({ host, token });

    this.log('Authorize succeed!');
  }
}
