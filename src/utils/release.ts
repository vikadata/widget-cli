import cli from 'cli-ux';
import * as path from 'path';
import * as fse from 'fs-extra';
import * as semver from 'semver';
import { findWidgetRootDir } from './root_dir';
import { uploadPackage } from './upload';
import { EFileType } from '../interface/api_dict_enum';
import { getVersion } from './project';

interface IReleasePackageAssets {
  icon: string;
  cover: string;
  authorIcon: string;
}

interface IReleaseConfigAssets {
  releaseCodeBundle: string;
	sourceCodeBundle?: string;
}

export const uploadPackageBundle = async(
  assets: IReleaseConfigAssets,
  option: { packageId: string, version: string },
  auth: { host: string, token: string }) => {
  const { packageId, version } = option;
  const rootDir = findWidgetRootDir();
  const existFiles = Object.entries(assets).filter(([key, value]) => Boolean(value));
  const files = existFiles.map(([key, value]) => ({ name: key, entity: fse.createReadStream(path.join(rootDir, value)) }));
  cli.action.start('uploading bundle');
  const filesEntity = files.map(v => v.entity);
  const tokenArray = await uploadPackage({ auth, files: filesEntity, opt: {
    type: EFileType.PACKAGE,
    packageId,
    version
  }});
  cli.action.stop();
  const releaseCodeBundleTokenIndex = files.findIndex(v => v.name === 'releaseCodeBundle');
  const sourceCodeBundleTokenIndex = files.findIndex(v => v.name === 'sourceCodeBundle');
  // return order [releaseCodeBundleToken, sourceCodeBundleToken]
  return [tokenArray[releaseCodeBundleTokenIndex], tokenArray[sourceCodeBundleTokenIndex]];
};

export const uploadPackageAssets = async(
  assets: IReleasePackageAssets,
  option: { packageId: string, version: string },
  auth: { host: string, token: string }
) => {
  const { packageId, version } = option;
  const rootDir = findWidgetRootDir();
  const existFiles = Object.entries(assets).filter(([key, value]) => Boolean(value));
  const files = existFiles.map(([key, value]) => ({ name: key, entity: fse.createReadStream(path.join(rootDir, value)) }));
  cli.action.start('uploading package assets');
  const filesEntity = files.map(v => v.entity);
  const tokenArray = await uploadPackage({ auth, files: filesEntity, opt: {
    type: EFileType.PACKAGE_CONFIG,
    packageId,
    version
  }});
  cli.action.stop();
  const iconTokenIndex = files.findIndex(v => v.name === 'icon');
  const coverTokenIndex = files.findIndex(v => v.name === 'cover');
  const authorIconTokenIndex = files.findIndex(v => v.name === 'authorIcon');
  // return order [iconToken, coverToken, authIconToken]
  return [tokenArray[iconTokenIndex], tokenArray[coverTokenIndex], tokenArray[authorIconTokenIndex]];
};

export const checkVersion = (version: string, curVersion: string) => {
  if (!semver.valid(version)) {
    console.error(`invalid version: ${version}`);
    return false;
  }

  if (semver.lt(version, curVersion)) {
    console.error(`version: ${version} is less than current version ${curVersion}`);
    return false;
  }
  return true;
};

// make sure version is valid and greater than current
export const increaseVersion = () => {
  const curVersion = getVersion();
  if (!curVersion) {
    throw(new Error('package version can not found'));
  }

  return semver.inc(curVersion, 'patch')!;
};
