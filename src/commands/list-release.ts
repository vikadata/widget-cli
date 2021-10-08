import { Command, flags } from '@oclif/command';
import axios from 'axios';
import * as chalk from 'chalk';
import { IApiWrapper } from '../interface/api';
import * as apiDictMapping from '../interface/api_dict_mapping';
import { translate } from '../interface/dict';
import { autoPrompt } from '../utils/prompt';
import { cli } from 'cli-ux';
import { wrapOutput } from '../utils/string';

export default class ListRelease extends Command {
  static description = 'List all version information for your widget package release';

  static examples = [
    `$ widget-cli list-release [packageId]
Succeed!
`,
  ];

  static flags = {
    host: flags.string({ char: 'h', description: 'Specifies the host of the server, such as https://vika.cn' }),
    token: flags.string({ char: 't', description: 'Your API Token' }),
    global: flags.boolean({ char: 'g', description: 'Specify global widget package' })
  };

  static args = [
    { name: 'packageId', description: 'The widget package you want to unpublish' },
  ];

  async getPackageRelease({ host, token, packageId }: { host: string, token: string, packageId: string }) {
    const result = await axios.get<IApiWrapper>(`/widget/package/release/history/${packageId}`, {
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

  async getWidgetPackage({ host, token, packageId }: { host: string, token: string, packageId: string }) {
    const result = await axios.get<IApiWrapper>(`/widget/package/${packageId}`, {
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

  async logWidgetPackage({ host, token, packageId }: { host: string, token: string, packageId: string }) {
    const widgetPackage = await this.getWidgetPackage({ host, token, packageId });

    if (!widgetPackage.data) {
      this.log(chalk.yellowBright(`packageId: ${packageId} not exist`));
      return widgetPackage;
    }

    this.log(chalk.yellowBright('=== Package Details ==='));
    Object.entries(widgetPackage.data).forEach(([key, value]) => {
      value != null && this.log((key + ':').padEnd(15) + this.formatWidgetPackageOutput(key, value));
    });

    this.log();
    this.log(chalk.yellowBright('=== Package Release Details ==='));
    const packageRelease = await this.getPackageRelease({ host, token, packageId });
    cli.table(packageRelease.data || [{}], this.packageReleaseTableConfig(), {
      'no-truncate': true
    });

    return widgetPackage;
  }

  // format str out
  formatWidgetPackageOutput(key: string, value: any) {
    switch (key) {
      case 'status': {
        return translate(apiDictMapping.widgetStatusMapping, value);
      }
      case 'packageType': {
        return translate(apiDictMapping.packageTypeMapping, value);
      }
      case 'releaseType': {
        return translate(apiDictMapping.releaseTypeMapping, value);
      }
      default: {
        return value;
      }
    }
  }

  // release table columns config
  packageReleaseTableConfig() {
    return {
      releaseSha: {
        get: (row: any) => {
          return this.tableNoDataOutput(row.releaseSha);
        }
      },
      version: {
        get: (row: any) => {
          return this.tableNoDataOutput(row.version);
        }
      },
      releaseCodeBundle: {
        get: (row: any) => {
          return wrapOutput(this.tableNoDataOutput(row.releaseCodeBundle), 34);
        }
      },
      sourceCodeBundle: {
        get: (row: any) => {
          return wrapOutput(this.tableNoDataOutput(row.sourceCodeBundle), 34);
        }
      },
      status: {
        get: (row: any) => {
          const formatStr = translate(apiDictMapping.releaseStatusMapping, row.status);
          return this.tableNoDataOutput(formatStr);
        }
      }
    };
  }

  tableNoDataOutput(data: any, str?: string) {
    return data || (str || 'No data');
  }

  async run() {
    const { host, token, packageId } = await autoPrompt(this.parse(ListRelease));
    await this.logWidgetPackage({ host, token, packageId });
  }
}
