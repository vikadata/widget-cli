import { Command, flags } from '@oclif/command';
import * as https from 'https';
import * as http from 'http';
import * as fse from 'fs-extra';
import * as chalk from 'chalk';
import * as path from 'path';
import * as express from 'express';
import Config from '../config';
import { getPackageJSON, getWidgetConfig, startCompile } from '../utils/project';
import { createWidgetCliSocket } from '../utils/socket';
import { IWidgetCliSocket } from '../interface/socket';
import { cors } from '../utils/cors';

const sslDir = path.resolve(__dirname, '../../ssl');

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

  hostCompliedFile(port: string, protocol: string) {
    const app = express();
    let server = null;

    if (protocol === 'https') {
      const privateKey = fse.readFileSync(path.resolve(sslDir, 'server.key'), 'utf8');
      const certificate = fse.readFileSync(path.resolve(sslDir, 'server.crt'), 'utf8');
      const credentials = { key: privateKey, cert: certificate };

      server = https.createServer(credentials, app);
      app.use(express.static(path.join(Config.releaseCodePath)));
      app.use(cors());
      this.widgetCliSocket = createWidgetCliSocket(server);
      // sandbox
      const widgetConfig = getWidgetConfig();
      app.get('/widgetConfig', (req, res) => {
        res.send({
          sandbox: widgetConfig.sandbox,
          packageId: widgetConfig.packageId
        });
      });
      // cli info
      app.get('/widget-cli/info', (req, res) => {
        const widgetCliPackageJSON = getPackageJSON(path.resolve(__dirname, '../../'));
        res.send({
          version: widgetCliPackageJSON.version
        });
      });
    } else {
      server = http.createServer(app);
      app.get('/ping.png', (req, res) => {
        res.sendFile(path.resolve(__dirname, '../../ping.png'));
      });
    }
    server.listen(port);
  }

  async run() {
    const { flags: { port, protocol }} = this.parse(Start);
    let firstCompile = true;
    const widgetConfig = getWidgetConfig();

    startCompile('dev', false, widgetConfig, () => {
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
      this.hostCompliedFile(port, protocol);
      this.hostCompliedFile(String(Number(port) + 1), 'http');
    } catch (error) {
      this.error(error as any);
    }
  }
}
