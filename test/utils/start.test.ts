import { expect } from 'chai';
import * as path from 'path';
import * as fse from 'fs-extra';
import * as express from 'express';
import { hostComplied } from '../../src/utils/start';
import * as widgetSocket from '../../src/utils/socket';
import * as project from '../../src/utils/project';
import { templateWidgetConfig } from '../mocks/widget_config';

const request = require('supertest');
const sinon = require('sinon');

describe('utils start module', () => {

  it('hostComplied http', async() => {
    sinon.stub(project, 'getPackageJSON').callsFake(() => {
      return { version: '0.0.1' };
    });
    const app = express();
    const complied = hostComplied(app, '9000', 'http');
    expect(complied.widgetCliSocket).to.equal(undefined);

    const infoRes = await request(app).get('/widget-cli/info');
    expect(infoRes.body.version).to.equal('0.0.1');

    const pingRes = await request(app).get('/ping.png');
    const pingBuffer = fse.readFileSync(path.resolve(__dirname, '../../ping.png'));
    expect(pingBuffer.compare(pingRes.body)).to.equal(0);
    complied.server.close();
  });

  it('hostComplied https', async() => {
    sinon.stub(widgetSocket, 'createWidgetCliSocket').callsFake(() => {
      return 'widgetSocket';
    });
    sinon.stub(project, 'getWidgetConfig').callsFake(() => {
      return templateWidgetConfig;
    });
    const app = express();
    const complied = hostComplied(app, '9000', 'https');
    expect(complied.widgetCliSocket).to.equal('widgetSocket');

    const infoRes = await request(app).get('/widgetConfig');
    expect(infoRes.body.sandbox).to.equal(templateWidgetConfig.sandbox);
    complied.server.close();
  });
});
