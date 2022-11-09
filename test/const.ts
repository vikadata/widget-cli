import * as path from 'path';

export const localRootDir = path.resolve(process.cwd(), 'test/fixtures/local');

export const buildRootDir = path.resolve(process.cwd(), 'test/fixtures/build');

export const widgetConfigJson = {
  version: '1.0.0',
  packageId: 'wpkDeveloper',
};

export const packageJson = {
  name: 'widget',
  version: '1.0.0'
};

export const authYml = {
  token: 'uskGd71dtx3hFxIVZ6XOMBv',
  host: 'https://vika.cn'
};

