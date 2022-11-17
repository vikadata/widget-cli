import { expect, test } from '@oclif/test';
import axios from 'axios';
import { cli } from 'cli-ux';
import * as promptModule from '../../src/utils/prompt';
import * as rootDirModule from '../../src/utils/root_dir';
import * as uploadModule from '../../src/utils/upload';
import * as projectModule from '../../src/utils/project';
import * as submitModule from '../../src/utils/release';
import { templateWidgetConfig } from '../mocks/widget_config';
import { submitAxios } from '../mocks/axios';
import { buildRootDir } from '../const';

describe('submit command', () => {
  const submitVersion = '0.0.1';
  const currentVersion = '0.0.0';

  const submitCommand = test
    .stdout()
    .stub(rootDirModule, 'findWidgetRootDir', () => buildRootDir)
    .stub(promptModule, 'hostPrompt', async() => 'host')
    .stub(promptModule, 'tokenPrompt', async() => 'token')
    .stub(projectModule, 'getWidgetConfig', () => templateWidgetConfig)
    .stub(projectModule, 'setWidgetConfig', () => {})
    .stub(projectModule, 'getVersion', () => currentVersion)
    .stub(projectModule, 'startCompile', (...args: any) => args[3]())
    .stub(submitModule, 'uploadPackageBundle', async() => ['submitCodeBundleToken'])
    .stub(submitModule, 'uploadPackageAssets', async() => ['iconToken', 'coverToken', 'authorIconToken'])
    .stub(axios, 'get', submitAxios)
    .stub(axios, 'post', submitAxios)
    .stub(uploadModule, 'getUploadMeta', () => ({
      endpoint: ''
    }))
    .stub(cli.action, 'start', () => {
      return () => {};
    })
    .stub(cli.action, 'stop', () => {
      return () => {};
    });

  submitCommand
    .command(['submit', 'wpkDeveloper', '--version=' + submitVersion])
    .it('submit successful', ctx => {
      expect(ctx.stdout).to.contains('successful submit widget');
    });
});
