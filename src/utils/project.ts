/* eslint-disable no-console */
import * as path from 'path';
import * as YAML from 'yaml';
import * as fse from 'fs-extra';
import { findWidgetRootDir } from './root_dir';
import Config from '../config';
import { IWidgetConfig } from '../interface/widget_config';
import { IWebpackConfig } from '../interface/webpack';

const createBundler = require('@vikadata/widget-webpack-bundler').default;

export function getWidgetConfig(rootDir?: string): IWidgetConfig {
  rootDir = rootDir ?? findWidgetRootDir();
  return JSON.parse(fse.readFileSync(path.join(rootDir, Config.widgetConfigFileName), 'utf8'));
}

export function getPackageJSON(rootDir?: string) {
  rootDir = rootDir ?? findWidgetRootDir();
  return require(path.join(rootDir, 'package.json'));
}

export function setPackageJson(params: Record<string, any>, rootDir?: string) {
  rootDir = rootDir ?? findWidgetRootDir();
  let json = getPackageJSON(rootDir);
  json = { ...json, ...params };
  delete json.name;
  fse.writeFileSync(path.join(rootDir, 'package.json'), JSON.stringify(json, null, 2));
}

export function setWidgetConfig(params: Partial<IWidgetConfig>, rootDir?: string) {
  rootDir = rootDir ?? findWidgetRootDir();
  let json = getWidgetConfig(rootDir);
  json = { ...json, ...params };
  fse.writeFileSync(path.join(rootDir, Config.widgetConfigFileName), JSON.stringify(json, null, 2));
}

export function getName() {
  const packageJSON = getPackageJSON();
  return packageJSON.name;
}

export function getVersion(): string {
  const packageJSON = getPackageJSON();
  return packageJSON.version;
}

export function getPrivateConfig(rootDir?: string): {token?: string; host?: string} {
  try {
    rootDir = rootDir ?? findWidgetRootDir();
  } catch (error) {
    return {};
  }

  const yamlPath = path.resolve(rootDir, Config.widgetYamlFileName);
  let file: string | null = null;
  try {
    // file not exist will throw an error
    file = fse.readFileSync(yamlPath, 'utf8');
  } catch (error) {
    return {};
  }

  return file ? YAML.parse(file) : {};
}

export function updatePrivateConfig({ token, host }: {token?: string; host?: string}, rootDir?: string) {
  rootDir = rootDir ?? findWidgetRootDir();
  const yamlPath = path.resolve(rootDir, Config.widgetYamlFileName);
  const privateConfig = getPrivateConfig(rootDir);

  privateConfig.token = token;
  privateConfig.host = host;

  const fileToSave = YAML.stringify(privateConfig);
  fse.outputFileSync(yamlPath, fileToSave);
}

export function getWidgetCustomizeConfigBundler() {
  const customizeConfigName = 'customize.config.js';
  const rootDir = findWidgetRootDir();
  const customizeConfigPath = path.join(rootDir, customizeConfigName);
  if(!fse.pathExistsSync(customizeConfigPath)) {
    return null;
  }
  return require(customizeConfigPath).default;
}

export function startCompile(mode: 'production' | 'development', globalFlag: boolean, webpackConfig: IWebpackConfig, onSucceed: () => void) {
  const rootDir = findWidgetRootDir();
  const customizeBundler = getWidgetCustomizeConfigBundler() || createBundler((config: any) => config);

  customizeBundler.startDevServer({
    emitBuildState: ({ status }: any) => {
      if (status === 'success') {
        onSucceed();
      }
    },
    mode,
    entry: path.join(rootDir, webpackConfig.entry),
    internal: {
      widgetConfig: getWidgetConfig(),
      assetsPublic: webpackConfig.assetsPublic,
      ...Config
    }
  });
};
