/* eslint-disable no-console */
import { Command, flags } from '@oclif/command';
import * as chalk from 'chalk';
import * as path from 'path';
import * as express from 'express';
import Config from '../config';
import { startCompile } from '../utils/project';

export default class Start extends Command {
  static description = 'start current widget project in develop mode';

  static examples = [
    `$ widget-cli start
Compiling...
`,
  ];

  static flags = {
    port: flags.string({ char: 'p', description: 'Specifies the port of the local server', default: '9000' }),
    debug: flags.boolean({ description: 'show debug information for cli it self' }),
  };

  hostCompliedFile(port: string) {
    const app = express();
    app.listen(port);
    app.use(express.static(path.join(Config.releaseCodePath)));
  }

  async run() {
    const { flags: { port }} = this.parse(Start);

    startCompile('dev', () => {
      this.log(chalk.cyanBright('************************'));
      this.log(chalk.yellowBright('Copy the following address and paste it into the developing widget container:'));
      this.log(chalk.yellowBright(`http://localhost:${port}/${Config.releaseCodeName}`));
      this.log(chalk.cyanBright('************************'));
    });
    this.hostCompliedFile(port);
  }
}
