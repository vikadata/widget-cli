import { expect, test } from '@oclif/test';
import Init from '../../src/commands/init';
import * as path from 'path';
import * as fse from 'fs-extra';
import { templateZipUrl } from '../const';
import { getWidgetConfig, getPrivateConfig } from '../../src/utils/project';

describe('init command', () => {
  const initTemplateDir = path.resolve(templateZipUrl, '../template');
  const packageJsonUrl = path.join(initTemplateDir, 'package.json');

  afterEach(() => {
    // clear write
    fse.remove(initTemplateDir);
    fse.writeFileSync(packageJsonUrl, '{}');
  });

  test
    .stdout()
    .stub(Init.prototype, 'generateRootDir', () => initTemplateDir)
    .stub(Init.prototype, 'gitInit', () => {})
    .stub(Init.prototype, 'fetchTemplate', async() => fse.readFileSync(templateZipUrl))
    .command(['init', '-h=host', '-t=token', '-p=wpkDeveloper', '-s=spcxxxxx', '-c=widget', '-u=template'])
    .it('init success', ctx => {
      const packageJson = JSON.parse(fse.readFileSync(packageJsonUrl, 'utf8'));
      const widgetConfig = getWidgetConfig(initTemplateDir);
      const privateConfig = getPrivateConfig(initTemplateDir);
      expect(packageJson.version).to.equal('0.0.0');
      // eslint-disable-next-line max-len
      expect(JSON.stringify(widgetConfig)).to.equal('{"packageId":"wpkDeveloper","spaceId":"spcxxxxx","name":{"zh-CN":"widget","en-US":"widget"},"description":{"zh-CN":"widget 的描述","en-US":"widget description"}}');
      expect(JSON.stringify(privateConfig)).to.equal('{"token":"token","host":"host"}');
      expect(ctx.stdout).to.equal('your widget: widget is successfully created, cd ./widget go check!\n');
    });
});
