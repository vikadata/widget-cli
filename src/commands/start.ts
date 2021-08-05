import { Command, flags } from '@oclif/command';
import * as https from 'https';
import * as http from 'http';
import * as fse from 'fs-extra';
import * as chalk from 'chalk';
import * as path from 'path';
import * as express from 'express';
import Config from '../config';
import { startCompile } from '../utils/project';

const sslDir = path.resolve(__dirname, '../../ssl');

export default class Start extends Command {
  static description = 'start current widget project in develop mode';

  static examples = [
    `$ widget-cli start
Compiling...
`,
  ];

  static flags = {
    port: flags.string({ char: 'p', description: 'specifies the port of the local server', default: '9000' }),
    protocol: flags.string({ char: 'o', description: 'specifies the protocol of the local server', default: 'https' }),
    debug: flags.boolean({ description: 'show debug information for cli it self' }),
  };

  hostCompliedFile(port: string, protocol: string) {
    const app = express();

    if (protocol === 'https') {
      const privateKey = fse.readFileSync(path.resolve(sslDir, 'server.key'), 'utf8');
      const certificate = fse.readFileSync(path.resolve(sslDir, 'server.crt'), 'utf8');
      const credentials = { key: privateKey, cert: certificate };

      https.createServer(credentials, app).listen(port);
    } else {
      http.createServer(app).listen(port);
    }

    app.use(express.static(path.join(Config.releaseCodePath)));
  }

  async run() {
    const { flags: { port, protocol }} = this.parse(Start);
    let firstCompile = true;

    startCompile('dev', () => {
      if (firstCompile) {
        this.log(chalk.cyanBright('************************'));
        this.log(chalk.yellowBright('Copy the following address and paste it into the developing widget container:'));
        this.log(chalk.yellowBright(`${protocol}://localhost:${port}/${Config.releaseCodeName}`));
        this.log(chalk.cyanBright('************************'));
      } else {
        this.log('Code has been recompiled');
      }
      firstCompile = false;
    });
    this.hostCompliedFile(port, protocol);
  }
}
