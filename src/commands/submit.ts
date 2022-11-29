import { flags } from '@oclif/command';
import cli from 'cli-ux';
import axios from 'axios';
import * as fse from 'fs-extra';
import * as path from 'path';
import * as chalk from 'chalk';
import { getVersion, getWidgetConfig, setWidgetConfig } from '../utils/project';
import { readableFileSize } from '../utils/file';
import { IApiWrapper } from '../interface/api';
import Config from '../config';
import { hostPrompt, tokenPrompt } from '../utils/prompt';
import Release, { IReleaseParams } from './release';
import { getUploadMeta } from '../utils/upload';
import { asyncExec } from '../utils/exec';
import { AssetsType, ReleaseType } from '../enum';
import { increaseVersion, uploadPackageAssets, uploadPackageBundle } from '../utils/release';
import { findWidgetRootDir } from '../utils/root_dir';

export default class Submit extends Release {
  static description = 'Submit your widget package';

  static examples = [
    `$ widget-cli submit
Succeed!
`,
  ];

  static flags = {
    host: flags.string({ char: 'h', description: 'Specifies the host of the server, such as https://apitable.com' }),
    token: flags.string({ char: 't', description: 'Your API Token' }),
    version: flags.string({ char: 'v', description: 'Specifies the version of the project' }),
    global: flags.boolean({ char: 'g', hidden: true, description: 'Release this widget package to global' }),
    spaceId: flags.string({ char: 's', hidden: true, description: 'Specifies the spaceId where you want to release' }),
    ci: flags.boolean({ description: 'Run in CI mode, no prompt' }),
    openSource: flags.boolean({
      char: 'o', hidden: true, description: 'Upload and share source code with users, current used in example template',
    }),
  };

  static args = [
    { name: 'packageId', description: 'The widget package id', hidden: true },
  ];

  async submitWidget(data: IReleaseParams, auth: { host: string, token: string }) {
    const { host, token } = auth;
    const result = await axios.post<IApiWrapper>('/widget/package/v2/submit', data, {
      baseURL: `${host}/api/v1`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!result.data.success) {
      this.error(result.data.message, { code: String(result.data.code), exit: 1 });
    }
  }

  async run() {
    const parsed = this.parse(Submit);
    let { args: { packageId }, flags: { version, host, token, openSource, ci }} = parsed;

    packageId = this.getPackageId(packageId, true);
    host = await hostPrompt(host);
    token = await tokenPrompt(token);

    const currentVersion = getVersion();
    if (!version) {
      if (ci) {
        version = increaseVersion();
      } else {
        version = await cli.prompt('submit version', { default: increaseVersion(), required: true }) as string;
      }
      await asyncExec(`npm version ${version}`);
    }
    this.validVersion(version!, currentVersion);

    const widgetConfig = getWidgetConfig();
    let {
      icon, cover, name,
      description, authorName, authorIcon, authorLink, authorEmail, sandbox, website
    } = widgetConfig;

    if (!ci) {
      if (!packageId) {
        packageId = await cli.prompt('packageId');
      }

      if (!authorName) {
        authorName = await cli.prompt('Author name');
      }

      if (!authorLink) {
        authorLink = await cli.prompt('Author website');
      }

      if (!authorEmail) {
        authorEmail = await cli.prompt('Author Email');
      }

      if (!website) {
        website = await cli.prompt('Website');
      }
    }

    const widgetPackage = await this.getWidgetPackage({ host, token, packageId });
    if (!widgetPackage.data) {
      this.error(`${packageId} is not available packageId`);
    }
    if (widgetPackage.data.releaseType !== ReleaseType.Global) {
      this.error(`${packageId} is not global packageId`);
    }

    setWidgetConfig({ authorName, authorLink, authorEmail, website, globalPackageId: packageId });

    const uploadMeta = await getUploadMeta({ token, host });

    // build production code for submit
    cli.action.start('compiling');
    await this.compile(true, { assetsPublic: uploadMeta.endpoint, entry: widgetConfig.entry });
    cli.action.stop();

    const rootDir = findWidgetRootDir();
    const releaseCodeBundle = path.resolve(rootDir, Config.releaseCodePath, Config.releaseCodeProdName);
    const codeSize = fse.statSync(releaseCodeBundle).size;
    const outputName = `${packageId}@${version}`;

    this.log();
    this.log(chalk.yellowBright('=== Package Details ==='));
    this.log(`name:                ${name['en-US']}`);
    this.log(`host:                ${host}`);
    this.log(`globalPackageId:     ${packageId}`);
    this.log(`version:             ${version}`);
    this.log(`releaseBundleSize:   ${readableFileSize(codeSize)}`);
    this.log(`description          ${description['en-US']}`);
    this.log(`icon                 ${icon}`);
    this.log(`cover                ${cover}`);
    this.log(`authorName           ${authorName}`);
    this.log(`authorIcon           ${authorIcon}`);
    this.log(`authorEmail          ${authorEmail}`);
    this.log(`authorLink           ${authorLink}`);
    this.log(`sandbox              ${sandbox}`);
    this.log(`website              ${website}`);

    let secretKey;
    let sourceCodeBundle;
    if (openSource) {
      // pack sourceCode to zip
      const result = await this.packSourceCode({ outputName });
      this.logSourceCode(result);
      secretKey = result.secretKey;
      sourceCodeBundle = result.outputFile;
    }
    this.log();

    await this.uploadAssets(AssetsType.Images, packageId, { host, token });

    const [iconToken, coverToken, authorIconToken] = await uploadPackageAssets(
      { icon, cover, authorIcon }, { version, packageId }, { host, token }
    );
    const [releaseCodeBundleToken, sourceCodeBundleToken] = await uploadPackageBundle(
      { releaseCodeBundle, sourceCodeBundle }, { version, packageId }, { host, token }
    );

    const data = {
      packageId,
      version,
      name: JSON.stringify(name),
      authorName,
      authorLink,
      authorEmail,
      description: JSON.stringify(description),
      secretKey,
      sandbox,
      iconToken,
      coverToken,
      authorIconToken,
      releaseCodeBundleToken,
      sourceCodeBundleToken,
      website: website!
    };
    cli.action.start('uploading');
    await this.submitWidget(data, { host, token });
    sourceCodeBundle && fse.removeSync(sourceCodeBundle);
    cli.action.stop();
    this.log(chalk.greenBright(`successful submit widget ${outputName}`));
  }
}
