import { flags } from '@oclif/command';
import cli from 'cli-ux';
import axios from 'axios';
import * as fse from 'fs-extra';
import * as chalk from 'chalk';
import * as FormData from 'form-data';
import { getWidgetConfig, setPackageJson, setWidgetConfig } from '../utils/project';
import { readableFileSize } from '../utils/file';
import { IApiWrapper } from '../interface/api';
import Config from '../config';
import { hostPrompt, tokenPrompt } from '../utils/prompt';
import Release from './release';

export default class Submit extends Release {
  static description = 'Submit your widget package';

  static examples = [
    `$ widget-cli submit
Succeed!
`,
  ];

  static flags = {
    host: flags.string({ char: 'h', description: 'Specifies the host of the server, such as https://vika.cn' }),
    token: flags.string({ char: 't', description: 'Your API Token' }),
    version: flags.string({ char: 'v', description: 'Specifies the version of the project' }),
    global: flags.boolean({ char: 'g', hidden: true, description: 'Release this widget package to global' }),
    spaceId: flags.string({ char: 's', hidden: true, description: 'Specifies the spaceId where you want to release' }),
    openSource: flags.boolean({
      char: 'o', hidden: true, description: 'Upload and share source code with users, current used in example template',
    }),
  };

  static args = [
    { name: 'packageId', description: 'The widget package id', hidden: true },
  ];

  async submitWidget(form: FormData, auth: { host: string, token: string }) {
    const { host, token } = auth;
    const result = await axios.post<IApiWrapper>('/widget/package/submit', form, {
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      baseURL: `${host}/api/v1`,
      headers: {
        // 'Content-Type': `multipart/form-data; boundary=${formData.getBoundary()}`,
        Authorization: `Bearer ${token}`,
        ...form.getHeaders()
      },
      onUploadProgress: (event) => {
        console.log('call me');
        console.log(event);
      },
    });
    if (!result.data.success) {
      this.error(result.data.message, { code: String(result.data.code), exit: 1 });
    }
  }

  async run() {
    const parsed = this.parse(Submit);
    let { args: { packageId }, flags: { version, host, token, openSource }} = parsed;

    packageId = this.getPackageId(packageId, true);
    host = await hostPrompt(host);
    token = await tokenPrompt(token);

    if (!version) {
      version = await cli.prompt('submit version', { default: this.increaseVersion(), required: true });
    }

    version = this.checkVersion(version!);

    setPackageJson({ version });
    const widgetConfig = getWidgetConfig();
    let {
      icon, cover, name,
      description, authorName, authorIcon, authorLink, authorEmail, sandbox, website
    } = widgetConfig;

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

    setWidgetConfig({ authorName, authorLink, authorEmail, website, globalPackageId: packageId });

    // build production code for submit
    cli.action.start('compiling');
    await this.compile(true, { ...widgetConfig, globalPackageId: packageId });
    cli.action.stop();

    const releaseCodeBundle = Config.releaseCodePath + Config.releaseCodeProdName;
    const codeSize = fse.statSync(releaseCodeBundle).size;
    const outputName = `${packageId}@${version}`;

    this.log();
    this.log(chalk.yellowBright('=== Package Details ==='));
    this.log(`name:                ${name['zh-CN'] || name['en-US']}`);
    this.log(`host:                ${host}`);
    this.log(`packageId:           ${packageId}`);
    this.log(`version:             ${version}`);
    this.log(`releaseBundleSize:   ${readableFileSize(codeSize)}`);
    this.log(`description          ${description['zh-CN'] || description['en-US']}`);
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

    const formData = this.buildFormData({
      packageId,
      icon,
      cover,
      version,
      name,
      authorName,
      authorIcon,
      authorLink,
      authorEmail,
      description,
      secretKey,
      releaseCodeBundle,
      sourceCodeBundle,
      sandbox,
      website: website!
    });
    cli.action.start('uploading');
    await this.submitWidget(formData, { host, token });
    sourceCodeBundle && fse.removeSync(sourceCodeBundle);
    cli.action.stop();
    this.log(chalk.greenBright(`successful submit widget ${outputName}`));
  }
}
