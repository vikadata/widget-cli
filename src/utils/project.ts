/* eslint-disable no-console */
import * as path from 'path';
import * as YAML from 'yaml';
import * as fse from 'fs-extra';
import * as webpack from 'webpack';
import { findWidgetRootDir } from './root_dir';
import Config from '../config';
import { IWidgetConfig } from '../interface/widget_config';
import { getWebpackConfig } from '../webpack.config';

export function getWidgetConfig(rootDir?: string): IWidgetConfig {
  rootDir = rootDir ?? findWidgetRootDir();
  return require(path.join(rootDir, Config.widgetConfigFileName));
}

export function getPackageJSON(rootDir?: string) {
  rootDir = rootDir ?? findWidgetRootDir();
  return require(path.join(rootDir, 'package.json'));
}

export function setPackageJson(key: string, value: string | number | null | JSON, rootDir?: string) {
  rootDir = rootDir ?? findWidgetRootDir();
  const json = getPackageJSON(rootDir);
  json[key] = value;
  fse.writeFileSync(path.join(rootDir, 'package.json'), JSON.stringify(json, null, 2));
}

export function setWidgetConfig(key: keyof IWidgetConfig, value: string | {[key: string]: string}, rootDir?: string) {
  rootDir = rootDir ?? findWidgetRootDir();
  const json = getWidgetConfig(rootDir);
  json[key] = value as any;
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

export function startCompile(mode: 'prod' | 'dev', onSucceed: () => void) {
  const rootDir = findWidgetRootDir();
  const widgetConfig = getWidgetConfig();
  const config = getWebpackConfig({ dir: rootDir, mode, config: widgetConfig, onSucceed });

  webpack(config, (err: any, stats: any) => {
    if (err) {
      if ((err as any).details!) {
        console.error((err as any).details);
      }
      console.error(err.stack || err);
    }

    if (!stats) {
      return;
    }

    const info = stats.toJson();

    if (!info) {
      return;
    }

    if (stats.hasErrors()) {
      info.errors!.forEach((e: any) => {
        console.error(e.message);
      });
    }

    if (stats.hasWarnings()) {
      info.warnings!.forEach((e: any) => {
        console.warn(e.message);
      });
    }

    info.logging && console.log(info.logging);
  });
}
