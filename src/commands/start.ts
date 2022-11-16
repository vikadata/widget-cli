import { Command, flags } from '@oclif/command';
import * as chalk from 'chalk';
import Config from '../config';
import { getWidgetConfig, startCompile } from '../utils/project';
import { IWidgetCliSocket } from '../interface/socket';
import { hostCompliedFile } from '../utils/start';

export default class Start extends Command {
  private widgetCliSocket: IWidgetCliSocket | undefined;

  static description = 'Start current widget project in develop mode';

  static examples = [
    `$ widget-cli start
Compiling...
`,
  ];

  static flags = {
    port: flags.string({ char: 'p', description: 'Specifies the port of the local server', default: '9000' }),
    protocol: flags.string({ char: 'o', description: 'Specifies the protocol of the local server', default: 'https' }),
    debug: flags.boolean({ description: 'Show debug information for cli it self' }),
  };

  async run() {
    const { flags: { port, protocol }} = this.parse(Start);
    let firstCompile = true;
    const widgetConfig = getWidgetConfig();

    startCompile('dev', false, { entry: widgetConfig.entry }, () => {
      if (firstCompile) {
        this.log(chalk.cyanBright('************************'));
        this.log(chalk.yellowBright(`Current packageID: ${widgetConfig.packageId}`));
        this.log(chalk.yellowBright('Copy the following address and paste it into the developing widget container:'));
        this.log(chalk.yellowBright(`${protocol}://localhost:${port}/${Config.releaseCodeName}`));
        this.log(chalk.cyanBright('************************'));
      } else {
        this.log('Code has been recompiled');
        this.log(chalk.yellowBright(`${protocol}://localhost:${port}/${Config.releaseCodeName}`));
        this.widgetCliSocket?.liveReload();
      }
      firstCompile = false;
    });
    try {
      this.widgetCliSocket = hostCompliedFile(port, protocol);
      hostCompliedFile(String(Number(port) + 1), 'http');
    } catch (error) {
      this.error(error as any);
    }
  }
}
