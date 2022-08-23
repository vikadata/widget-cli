import { flags } from '@oclif/command';
import cli from 'cli-ux';
import axios from 'axios';
import * as glob from 'glob';
import * as path from 'path';
import * as fse from 'fs-extra';
import * as parser from 'gitignore-parser';
import * as archiver from 'archiver';
import * as crypto from 'crypto';
import * as chalk from 'chalk';
import * as semver from 'semver';
import * as FormData from 'form-data';
import { findWidgetRootDir } from '../utils/root_dir';
import { getVersion, getWidgetConfig, setPackageJson, setWidgetConfig, startCompile } from '../utils/project';
import { readableFileSize } from '../utils/file';
import { generateRandomId, generateRandomString } from '../utils/id';
import { IApiWrapper } from '../interface/api';
import Config from '../config';
import { PackageType, ReleaseType } from '../enum';
import { hostPrompt, tokenPrompt } from '../utils/prompt';
import ListRelease from './list-release';
import { IWidgetConfig } from '../interface/widget_config';

archiver.registerFormat('zip-encrypted', require('archiver-zip-encrypted'));

interface IReleaseParams {
  packageId?: string; // will create a new widget package when packageId is undefined
  version: string;
  spaceId: string;
  name: { [key: string]: string }; // { 'zh-CN': '小组件', 'en-US': 'widget' }
  icon: string;
  cover: string;
  authorName: string;
  authorIcon: string;
  authorLink: string;
  authorEmail: string;
  description: { [key: string]: string }; // { 'zh-CN': '小组件', 'en-US': 'widget' }
	releaseCodeBundle: string;
	sourceCodeBundle?: string;
	secretKey?: string;
}

export default class Release extends ListRelease {
  static description = 'Release your widget package';

  static examples = [
    `$ widget-cli release
Succeed!
`,
  ];

  static flags = {
    host: flags.string({ char: 'h', description: 'Specifies the host of the server, such as https://vika.cn' }),
    token: flags.string({ char: 't', description: 'Your API Token' }),
    version: flags.string({ char: 'v', description: 'Specifies the version of the project' }),
    global: flags.boolean({ char: 'g', description: 'Release this widget package to global' }),
    spaceId: flags.string({ char: 's', hidden: true, description: 'Specifies the spaceId where you want to release' }),
    openSource: flags.boolean({
      char: 'o', hidden: true, description: 'Upload and share source code with users, current used in example template',
    }),
  };

  static args = [
    { name: 'packageId', description: 'The widget package id', hidden: true },
  ];

  getShaSum(file: string): Promise<string> {
    return new Promise(resolve => {
      const shaSum = crypto.createHash('sha1');
      const rs = fse.createReadStream(file);
      rs.on('data', function(data) {
        shaSum.update(data);
      });

      // making digest
      rs.on('end', function() {
        const hex = shaSum.digest('hex');
        resolve(hex);
      });
    });
  }

  pack(rootDir: string, outputName: string, files: string[], fileName: string, password?: string): Promise<archiver.Archiver> {
    return new Promise((resolve, reject) => {
      const output = fse.createWriteStream(path.join(rootDir, outputName));
      const outputDirPath = path.join(rootDir, fileName);
      if (!fse.pathExistsSync(outputDirPath)) {
        fse.mkdirSync(outputDirPath);
        fse.mkdirSync(path.join(outputDirPath, fileName));
      }
      const archive = password ?
        archiver('zip-encrypted' as any, { zlib: { level: 9 }, encryptionMethod: 'aes256', password } as any) :
        archiver('zip', { zlib: { level: 9 }});

      // listen for all archive data to be written
      // 'close' event is fired only when a file descriptor is involved
      output.on('close', () => {
        fse.remove(outputDirPath);
        resolve(archive);
      });

      // This event is fired when the data source is drained no matter what was the data source.
      // It is not part of this library but rather from the NodeJS Stream API.
      // @see: https://nodejs.org/api/stream.html#stream_event_end
      output.on('end', () => {
        this.log('Data has been drained');
        fse.remove(outputDirPath);
        resolve(archive);
      });

      // good practice to catch warnings (ie stat failures and other non-blocking errors)
      archive.on('warning', err => {
        if (err.code === 'ENOENT') {
          // log warning
          this.warn(err);
        } else {
          // throw error
          reject(err);
        }
      });

      // good practice to catch this error explicitly
      archive.on('error', function(err) {
        reject(err);
      });

      archive.pipe(output);

      files.forEach(file => {
        fse.copySync(file, path.join(outputDirPath, fileName ,file));
      });
      archive.directory(outputDirPath, false);

      archive.finalize();
    });
  }

  getPackageId(packageId: string | undefined, globalFlag: boolean | undefined) {
    if (packageId) {
      return packageId;
    }

    const widgetConfig = getWidgetConfig();
    return globalFlag ? widgetConfig.globalPackageId : widgetConfig.packageId;
  }

  getProjectFiles(rootDir: string): Promise<string[]> {
    // use .gitignore to ignore unnecessary files
    const gitignorePath = path.resolve(rootDir, '.gitignore');
    const ignoreFile = fse.readFileSync(gitignorePath, 'utf8');
    const ignore = parser.compile(ignoreFile);

    return new Promise((resolve, reject) => {
      glob('**/*', {
        dot: true,
        cwd: rootDir,
        nodir: true,
        // hard code node_modules for performance
        ignore: ['node_modules/**', '.git/**'],
      }, (err, files) => {
        if (err) {
          reject(err);
          return;
        }

        files = files.filter(ignore.accepts);
        resolve(files);
      });
    });
  }

  async releaseWidget(form: FormData, auth: { host: string, token: string }) {
    const { host, token } = auth;
    const result = await axios.post<IApiWrapper>('/widget/package/release', form, {
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

  async createWidgetPackage(
    params :
    {
      packageId?: string; name: {[key: string]: string};
      spaceId: string; packageType: PackageType; releaseType: ReleaseType;
      authorName?: string; authorLink?: string; authorEmail?: string;
    },
    auth: {host: string , token: string}
  ) {
    const { name, packageId, spaceId, packageType, releaseType, authorName, authorLink, authorEmail } = params;
    const { host, token } = auth;
    const data = {
      spaceId,
      packageId,
      packageType,
      releaseType,
      authorName,
      authorLink,
      authorEmail,
      name: JSON.stringify(name),
    };

    this.log(JSON.stringify(data, null, 2));
    const result = await axios.post<IApiWrapper<{packageId: string}>>('/widget/package/create', data, {
      baseURL: `${host}/api/v1`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (result.data.success) {
      this.log('Successful create widgetPackage from server');
    } else {
      this.error(result.data.message, { code: String(result.data.code) });
    }
    return result.data.data;
  }

  buildFormData(params: IReleaseParams) {
    const form = new FormData();
    const rootDir = findWidgetRootDir();
    const files = ['icon', 'cover', 'authorIcon', 'releaseCodeBundle', 'sourceCodeBundle'];
    const jsonString = ['name', 'description'];

    Object.entries(params).forEach(([key, value]) => {
      if (!value) {
        return;
      }

      if (files.includes(key)) {
        const file = fse.createReadStream(path.join(rootDir, value));
        form.append(key, file as any);
        return;
      }

      if (jsonString.includes(key)) {
        form.append(key, JSON.stringify(value));
        return;
      }

      form.append(key, value);
    });

    return form;
  }

  compile(global: boolean, widgetConfig: IWidgetConfig) {
    return new Promise(resolve => {
      this.log(chalk.yellowBright('=== Compiling Widget ==='));
      startCompile('prod', global, widgetConfig, () => {
        this.log(`Compile Succeed: ${Config.releaseCodePath + Config.releaseCodeProdName}`);
        resolve(undefined);
      });
    });
  }

  // make sure version is valid and greater than current
  increaseVersion() {
    const curVersion = getVersion();
    if (!curVersion) {
      this.error('package version can not found');
    }

    return semver.inc(curVersion, 'patch')!;
  }

  checkVersion(version: string) {
    const curVersion = getVersion();
    if (!semver.valid(version)) {
      this.error(`invalid version: ${version}`);
    }

    if (semver.lt(version, curVersion)) {
      this.error(`version: ${version} is less than current version ${curVersion}`);
    }

    return version;
  }

  async packSourceCode({ secure, outputName }: { secure?: boolean, outputName: string }) {
    // use this to unzip the output zip package
    const secretKey = secure ? generateRandomString(64) : undefined;
    const rootDir = findWidgetRootDir();
    const files = await this.getProjectFiles(rootDir);
    const outputFile = `${outputName}.zip`;
    const outputFilePath = path.join(rootDir, outputFile);
    // provide graceful log, inspired by npm pack
    this.log(chalk.greenBright(`📦  ${outputName}`));

    cli.action.start('packing source code');
    await this.pack(rootDir, outputFile, files, outputName, secretKey);
    cli.action.stop();

    const packageSize = fse.statSync(outputFilePath).size;
    const shaSum = await this.getShaSum(outputFilePath);

    return {
      outputFile,
      packageSize,
      secretKey,
      shaSum,
      files,
      rootDir,
    };
  }

  logSourceCode(result: {
    outputFile: string,
    packageSize: number,
    shaSum: string,
    files: string[],
    rootDir: string,
    secretKey?: string,
  }) {
    this.log();
    this.log(chalk.yellowBright('=== Source Code Contents ==='));
    let unpackedSize = 0;
    result.files.forEach(file => {
      const { size } = fse.statSync(file);
      // use padEnd to typography
      this.log(`${readableFileSize(size).padEnd(8)} ${path.relative(result.rootDir, file)}`);
      unpackedSize += size;
    });

    this.log(`filename:      ${result.outputFile}`);
    this.log(`package size:  ${readableFileSize(result.packageSize)}`);
    this.log(`unpacked size: ${readableFileSize(unpackedSize)}`);
    this.log(`shasum:        ${result.shaSum}`);
    this.log(`total files:   ${result.files.length}`);
    if (result.secretKey) {
      this.log(`secretKey:     ${result.secretKey}`);
    }
  }

  async run() {
    const parsed = this.parse(Release);
    let { args: { packageId }, flags: { version, global: globalFlag, spaceId, openSource, host, token }} = parsed;

    // let { packageId, host, token } = await autoPrompt(parsed);
    packageId = this.getPackageId(packageId, globalFlag);
    host = await hostPrompt(host);
    token = await tokenPrompt(token);

    if (!version) {
      version = await cli.prompt('release version', { default: this.increaseVersion(), required: true });
    }

    version = this.checkVersion(version!);

    setPackageJson({ version });
    const widgetConfig = getWidgetConfig();
    let {
      icon, cover, name,
      description, authorName, authorIcon, authorLink, authorEmail,
    } = widgetConfig;
    spaceId ??= widgetConfig.spaceId;

    if (globalFlag) {
      if (!authorName) {
        authorName = await cli.prompt('Author name');
      }

      if (!authorLink) {
        authorLink = await cli.prompt('Author website');
      }

      if (!authorEmail) {
        authorEmail = await cli.prompt('Author Email');
      }
      setWidgetConfig({ authorName, authorLink, authorEmail });
    }

    // if there is no packageId provide, we will create global package first
    if (!packageId) {
      if (!globalFlag) {
        this.error('can not find packageId in config');
      }

      const randomId = generateRandomId('wpk', 10);
      packageId = await cli.prompt(
        'Specify the globalPackageId, Start with "wpk" followed by 10 alphanumeric or numbers',
        { default: randomId },
      );

      const result = await this.createWidgetPackage({
        packageId, spaceId, name, authorName, authorEmail, authorLink,
        releaseType: ReleaseType.Global,
        packageType: PackageType.Official,
      }, { host, token });
      packageId = result.packageId;
      // save globalPackageId to config
      setWidgetConfig({ globalPackageId: packageId });
    } else {
      // check if package not exit then create it
      const widgetPackage = await this.getWidgetPackage({ host, token, packageId });
      if (!widgetPackage.data) {
        const goRelease = await cli.confirm(`Release a new widget with Id: ${packageId} Y/n?`);
        if (!goRelease) {
          return;
        }

        await this.createWidgetPackage({
          packageId, spaceId, name, authorName, authorEmail, authorLink,
          releaseType: globalFlag ? ReleaseType.Global : ReleaseType.Space,
          packageType: PackageType.Official,
        }, { host, token });
      }
    }

    // build production code for release
    cli.action.start('compiling');
    await this.compile(globalFlag, { ...widgetConfig, [globalFlag ? 'globalPackageId' : 'packageId']: packageId });
    cli.action.stop();

    const releaseCodeBundle = Config.releaseCodePath + Config.releaseCodeProdName;
    const codeSize = fse.statSync(releaseCodeBundle).size;
    const outputName = `${packageId}@${version}`;

    this.log();
    this.log(chalk.yellowBright('=== Package Details ==='));
    this.log(`name:                ${name['zh-CN'] || name['en-US']}`);
    this.log(`host:                ${host}`);
    this.log(`packageId:           ${packageId}`);
    this.log(`spaceId:             ${spaceId}`);
    this.log(`version:             ${version}`);
    this.log(`releaseBundleSize:   ${readableFileSize(codeSize)}`);
    this.log(`description          ${description['zh-CN'] || description['en-US']}`);
    this.log(`icon                 ${icon}`);
    this.log(`cover                ${cover}`);
    authorName && this.log(`authorName           ${authorName}`);
    authorIcon && this.log(`authorIcon           ${authorIcon}`);
    authorEmail && this.log(`authorEmail          ${authorEmail}`);
    this.log(`authorLink           ${authorLink}`);
    this.log(`releaseType          ${globalFlag ? 'global' : 'space'}`);

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
      spaceId,
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
      sourceCodeBundle,
      releaseCodeBundle,
    });
    cli.action.start('uploading');
    await this.releaseWidget(formData, { host, token });
    sourceCodeBundle && fse.removeSync(sourceCodeBundle);
    cli.action.stop();
    this.log(chalk.greenBright(`successful release widget ${outputName}`));
  }
}
