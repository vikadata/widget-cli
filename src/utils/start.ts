import * as https from 'https';
import * as http from 'http';
import * as fse from 'fs-extra';
import * as path from 'path';
import * as express from 'express';
import { cors } from './cors';
import Config from '../config';
import { createWidgetCliSocket } from './socket';
import { getPackageJSON, getWidgetConfig } from './project';
import { IWidgetCliSocket } from '../interface/socket';
import * as core from 'express-serve-static-core';

const sslDir = path.resolve(__dirname, '../../ssl');

export const hostComplied = (app: core.Express, port: string, protocol: string): {
  widgetCliSocket: IWidgetCliSocket | undefined;
  server: http.Server | https.Server;
} => {
  let server = null;
  app.use(cors());
  let widgetCliSocket: IWidgetCliSocket | undefined;
  if (protocol === 'https') {
    const privateKey = fse.readFileSync(path.resolve(sslDir, 'server.key'), 'utf8');
    const certificate = fse.readFileSync(path.resolve(sslDir, 'server.crt'), 'utf8');
    const credentials = { key: privateKey, cert: certificate };

    server = https.createServer(credentials, app);
    app.use(express.static(path.join(Config.releaseCodePath)));
    widgetCliSocket = createWidgetCliSocket(server);
    // sandbox
    const widgetConfig = getWidgetConfig();
    app.get('/widgetConfig', (req, res) => {
      res.send({
        sandbox: widgetConfig.sandbox,
        packageId: widgetConfig.packageId
      });
    });
  } else {
    server = http.createServer(app);
    // cli info
    app.get('/widget-cli/info', (req, res) => {
      const widgetCliPackageJSON = getPackageJSON(path.resolve(__dirname, '../../'));
      res.send({
        version: widgetCliPackageJSON.version
      });
    });
    app.get('/ping.png', (req, res) => {
      res.sendFile(path.resolve(__dirname, '../../ping.png'));
    });
  }
  server.listen(port);
  return {
    widgetCliSocket,
    server
  };
};

export const hostCompliedFile = (port: string, protocol: string) => {
  const app = express();
  return hostComplied(app, port, protocol).widgetCliSocket;
};

