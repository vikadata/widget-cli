/* eslint-disable no-console */
import * as path from 'path';
import * as YAML from 'yaml';
import * as fse from 'fs-extra';
import * as semver from 'semver';
import { findWidgetRootDir } from './root_dir';
import Config from '../config';
import { IWidgetConfig } from '../interface/widget_config';
import { IWebpackConfig } from '../interface/webpack';

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

export function getWidgetWebpackBundlerVersionInCli() {
  const widgetWebpackBundlerPathInCli = path.join(__dirname, '../../', 'node_modules', '@vikadata/widget-webpack-bundler', 'package.json');
  return require(widgetWebpackBundlerPathInCli).version;
}

export function checkWidgetWebpackBundlerVersion() {
  const rootDir = findWidgetRootDir();
  const widgetWebpackBundlerPathInWidget = path.join(rootDir, 'node_modules', '@vikadata/widget-webpack-bundler', 'package.json');
  if(!fse.pathExistsSync(widgetWebpackBundlerPathInWidget)) {
    return true;
  }
  const widgetWebpackBundlerVersionInWidget = require(widgetWebpackBundlerPathInWidget).version;
  const widgetWebpackBundlerVersionInCli = getWidgetWebpackBundlerVersionInCli();
  return semver.eq(widgetWebpackBundlerVersionInWidget, widgetWebpackBundlerVersionInCli)
}

export function startCompile(mode: 'production' | 'development', globalFlag: boolean, webpackConfig: IWebpackConfig, onSucceed: () => void) {
  const rootDir = findWidgetRootDir();
  const createBundler = require('@vikadata/widget-webpack-bundler').default;
  const customizeBundler = getWidgetCustomizeConfigBundler() || createBundler((config: any) => config);

  // check widget-webpack-bundler version in widget and in widget-cli is equal
  if (!checkWidgetWebpackBundlerVersion()) {
    throw new Error(`Please install @vikadata/widget-webpack-bundler@${getWidgetWebpackBundlerVersionInCli()}`);
  }

  const widgetConfig = getWidgetConfig();

  const options = {
    emitBuildState: ({ status }: any) => {
      if (status === 'success') {
        onSucceed();
      }
    },
    mode,
    entry: path.join(rootDir, webpackConfig.entry),
    internal: {
      widgetConfig: {
        ...widgetConfig,
        packageId: globalFlag ? widgetConfig.globalPackageId : widgetConfig.packageId
      },
      assetsPublic: webpackConfig.assetsPublic,
      ...Config,
    }
  }

  if (mode === 'development') {
    customizeBundler.startDevServer(options);
    return;
  }

  customizeBundler.buildBundle(options);

};
