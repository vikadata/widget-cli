import { expect } from 'chai';
import * as path from 'path';
import * as fse from 'fs-extra';
import { getPackageJSON, getPrivateConfig, getWidgetConfig, setPackageJson, setWidgetConfig, updatePrivateConfig } from '../../src/utils/project';
import Config from '../../src/config';
import { localRootDir, buildRootDir, widgetConfigJson, packageJson, authYml } from '../const';

describe('utils project module', () => {
  const packageJsonUrl = path.join(localRootDir, 'package.json');
  const widgetConfigJsonUrl = path.join(buildRootDir, Config.widgetConfigFileName);
  const authYmlUrl = path.join(localRootDir, Config.widgetYamlFileName);

  afterEach(() => {
    // clear write
    fse.writeFileSync(packageJsonUrl, '{}');
    fse.writeFileSync(widgetConfigJsonUrl, '{}');
    fse.writeFileSync(authYmlUrl, '');
  });

  it('getWidgetConfig', () => {
    const widgetConfig = getWidgetConfig(buildRootDir);
    expect(JSON.stringify(widgetConfig)).to.equal('{}');
  });

  it('getPackageJSON', () => {
    const packageJson = getPackageJSON(localRootDir);
    expect(JSON.stringify(packageJson)).to.equal('{}');
  });

  it('setPackageJson', () => {
    setPackageJson(packageJson, localRootDir);
    const json = JSON.parse(fse.readFileSync(packageJsonUrl, 'utf8'));
    expect(json.version).to.equal(packageJson.version);
  });

  it('setWidgetConfig', () => {
    setWidgetConfig(widgetConfigJson, buildRootDir);
    const json = getWidgetConfig(buildRootDir);
    expect(json.packageId).to.equal(widgetConfigJson.packageId);
  });

  it('getPrivateConfig', () => {
    const privateConfig = getPrivateConfig(localRootDir);
    expect(JSON.stringify(privateConfig)).to.equal('{}');
  });

  it('updatePrivateConfig', () => {
    updatePrivateConfig(authYml, localRootDir);
    const privateConfig = getPrivateConfig(localRootDir);
    expect(privateConfig.token).to.equal(authYml.token);
  });
});
