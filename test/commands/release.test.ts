import { expect, test } from '@oclif/test';
import axios from 'axios';
import * as path from 'path';
import { cli } from 'cli-ux';
import * as fse from 'fs-extra';
import * as promptModule from '../../src/utils/prompt';
import * as rootDirModule from '../../src/utils/root_dir';
import * as uploadModule from '../../src/utils/upload';
import * as projectModule from '../../src/utils/project';
import * as releaseModule from '../../src/utils/release';
import releaseCommandModule from '../../src/commands/release';
import { templateWidgetConfig } from '../mocks/widget_config';
import { releaseAxios } from '../mocks/axios';
import { buildRootDir } from '../const';

describe('release command', () => {
  const releaseVersion = '0.0.1';
  const currentVersion = '0.0.0';

  const releaseCommand = test
    .stdout()
    .stub(rootDirModule, 'findWidgetRootDir', () => buildRootDir)
    .stub(promptModule, 'hostPrompt', async() => 'host')
    .stub(promptModule, 'tokenPrompt', async() => 'token')
    .stub(projectModule, 'getWidgetConfig', () => templateWidgetConfig)
    .stub(projectModule, 'setWidgetConfig', () => {})
    .stub(projectModule, 'getVersion', () => currentVersion)
    .stub(projectModule, 'startCompile', (...args: any) => args[3]())
    .stub(releaseModule, 'uploadPackageBundle', async() => ['releaseCodeBundleToken'])
    .stub(releaseModule, 'uploadPackageAssets', async() => ['iconToken', 'coverToken', 'authorIconToken'])
    .stub(axios, 'get', releaseAxios)
    .stub(axios, 'post', releaseAxios)
    .stub(uploadModule, 'getUploadMeta', () => ({
      endpoint: ''
    }))
    .stub(cli.action, 'start', () => {
      return () => {};
    })
    .stub(cli.action, 'stop', () => {
      return () => {};
    });

  releaseCommand
    .command(['release', 'wpkDeveloper', '--version=' + releaseVersion])
    .it('release successful', ctx => {
      expect(ctx.stdout).to.contains('successful release widget');
    });

  releaseCommand
    .stub(cli, 'confirm', () => async() => true)
    .command(['release', 'wpkDeveloper__', '--version=' + releaseVersion])
    .it('packageId not exist in incoming', ctx => {
      expect(ctx.stdout).to.contains('Successful create widgetPackage from server');
    });
  releaseCommand
    .stub(releaseCommandModule.prototype, 'getPackageId', () => null)
    .command(['release', '--version=' + releaseVersion])
    .catch('can not find packageId in config')
    .it('packageId not exist in widget config');

  releaseCommand
    .command(['release', '--version=' + releaseVersion, '--openSource'])
    .it('state openSource', () => {
      const zipFileName = `${templateWidgetConfig.packageId}@${releaseVersion}.zip`;
      const zipUrl = path.join(buildRootDir, zipFileName);
      expect(fse.pathExistsSync(zipUrl)).to.equal(true);
      fse.remove(zipUrl);
    });
});
