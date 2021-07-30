import { Command, flags } from '@oclif/command';
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
import { getName, getPrivateConfig, getVersion, getWidgetConfig, setPackageJson, setWidgetConfig, startCompile } from '../utils/project';
import { readableFileSize } from '../utils/file';
import { generateRandomId, generateRandomString } from '../utils/id';
import { IApiWrapper } from '../interface/api';
import Config from '../config';
import { PackageType, ReleaseType } from '../enum';

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
	sourceCodeBundle: string;
	secretKey: string;
}

export default class Release extends Command {
  static description = 'release your widget package';

  static examples = [
    `$ widget-cli release
Succeed!
`,
  ];

  static flags = {
    version: flags.string({ char: 'v', description: 'Specifies the version of the project' }),
    global: flags.boolean({ char: 'g', description: 'Release this widget package to global' }),
  };

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

  pack(rootDir: string, outputName: string, password: string, files: string[]): Promise<archiver.Archiver> {
    return new Promise((resolve, reject) => {
      const output = fse.createWriteStream(path.join(rootDir, outputName));
      const archive = archiver('zip-encrypted' as any, { zlib: { level: 8 }, encryptionMethod: 'aes256', password } as any);

      // listen for all archive data to be written
      // 'close' event is fired only when a file descriptor is involved
      output.on('close', () => {
        resolve(archive);
      });

      // This event is fired when the data source is drained no matter what was the data source.
      // It is not part of this library but rather from the NodeJS Stream API.
      // @see: https://nodejs.org/api/stream.html#stream_event_end
      output.on('end', () => {
        this.log('Data has been drained');
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
        archive.append(fse.createReadStream(file), { name: path.relative(rootDir, file) });
      });

      archive.finalize();
    });
  }

  getProjectFiles(rootDir: string): Promise<string[]> {
    // use .gitignore to ignore unnecessary files
    const gitignorePath = path.resolve(rootDir, '.gitignore');
    const ignoreFile = fse.readFileSync(gitignorePath, 'utf8');
    const ignore = parser.compile(ignoreFile);

    return new Promise((resolve, reject) => {
      glob('**/*', {
        cwd: rootDir,
        nodir: true,
        // hard code node_modules for performance
        ignore: ['node_modules/**'],
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

  async releaseWidget(form: FormData) {
    const { host, token } = getPrivateConfig();
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
    { name, packageId, spaceId, packageType, releaseType, authorName, authorLink, authorEmail }:
    {
      packageId?: string; name: {[key: string]: string};
      spaceId: string; packageType: PackageType; releaseType: ReleaseType;
      authorName?: string; authorLink?: string; authorEmail?: string;
    }
  ) {
    const { host, token } = getPrivateConfig();

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

  compile() {
    return new Promise(resolve => {
      this.log(chalk.yellowBright('=== Compiling Widget ==='));
      startCompile('prod', () => {
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

  async getWidgetPackage(packageId: string) {
    const { host, token } = getPrivateConfig();

    const result = await axios.get<IApiWrapper<{packageType: PackageType}>>(`/widget/package/${packageId}`, {
      baseURL: `${host}/api/v1`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!result.data.success) {
      this.error(result.data.message, { code: String(result.data.code), exit: 1 });
    }
    return result.data;
  }

  async run() {
    let { flags: { version, global: globalFlag }} = this.parse(Release);

    if (!version) {
      version = await cli.prompt('release version', { default: this.increaseVersion(), required: true });
    }

    version = this.checkVersion(version!);
    setPackageJson('version', version);

    const rootDir = findWidgetRootDir();
    const files = await this.getProjectFiles(rootDir);

    const outputName = `${getName()}@${getVersion()}`;
    const outputFile = `${outputName}.zip`;
    const outputFilePath = path.join(rootDir, outputFile);
    // use this to unzip the output zip package
    const secretKey = generateRandomString(64);
    // provide graceful log, inspired by npm pack
    this.log(chalk.greenBright(`📦  ${outputName}`));

    // pack sourceCode to zip
    cli.action.start('packing source code');
    await this.pack(rootDir, outputFile, secretKey, files);
    cli.action.stop();
    // build production code for release
    cli.action.start('compiling');
    await this.compile();
    const packageSize = fse.statSync(outputFilePath).size;
    // for check
    const shaSum = await this.getShaSum(outputFilePath);
    cli.action.stop();

    this.log();
    this.log(chalk.yellowBright('=== Package Contents ==='));
    let unpackedSize = 0;
    files.forEach(file => {
      const { size } = fse.statSync(file);
      // use padEnd to typography
      this.log(`${readableFileSize(size).padEnd(8)} ${path.relative(rootDir, file)}`);
      unpackedSize += size;
    });
    this.log();
    this.log(chalk.yellowBright('=== Package Details ==='));
    this.log(`name:          ${getName()}`);
    this.log(`version:       ${version}`);
    this.log(`filename:      ${outputFile}`);
    this.log(`package size:  ${readableFileSize(packageSize)}`);
    this.log(`unpacked size: ${readableFileSize(unpackedSize)}`);
    this.log(`shasum:        ${shaSum}`);
    this.log(`total files:   ${files.length}`);
    this.log(`secretKey:     ${secretKey}`);

    let {
      globalPackageId, packageId, spaceId, icon, cover, name,
      description, authorName, authorIcon, authorLink, authorEmail,
    } = getWidgetConfig();
    // upload resources and get token
    this.log();
    const releaseCodeBundle = Config.releaseCodePath + Config.releaseCodeProdName;

    // release a global package
    if (globalFlag && !globalPackageId) {
      const packageInfo = await this.getWidgetPackage(packageId);
      let releaseWidgetType = 'Custom';
      if (packageInfo.data.packageType === PackageType.Official) {
        releaseWidgetType = 'Official';
        this.log(chalk.yellowBright('Your project is a Official widget project'));
      }
      this.log(chalk.yellowBright(`You are releasing a new [global] [${releaseWidgetType}] widget!`));

      const randomId = generateRandomId('wpk', 10);
      globalPackageId = await cli.prompt(
        'Specify the globalPackageId, Start with "wpk" followed by 10 alphanumeric or numbers',
        { default: randomId },
      );

      const result = await this.createWidgetPackage({
        packageId: globalPackageId, spaceId, name, authorName, authorEmail, authorLink,
        releaseType: ReleaseType.Global,
        packageType: packageInfo.data.packageType,
      });
      globalPackageId = result.packageId;
      // save globalPackageId to config
      setWidgetConfig('globalPackageId', globalPackageId);
    }

    const formData = this.buildFormData({
      spaceId,
      packageId: globalFlag ? globalPackageId : packageId,
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
      sourceCodeBundle: outputFile,
      releaseCodeBundle,
    });
    cli.action.start('uploading');
    await this.releaseWidget(formData);
    cli.action.stop();
    this.log(chalk.greenBright(`successful release widget ${outputName}`));
  }
}
