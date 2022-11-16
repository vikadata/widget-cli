
import { expect, test } from '@oclif/test';
import * as project from '../../src/utils/project';
import * as start from '../../src/utils/start';
import { templateWidgetConfig } from '../mocks/widget_config';

describe('start command', () => {
  const startCommand = test
    .stdout()
    .stub(project, 'getWidgetConfig', () => templateWidgetConfig)
    .stub(start, 'hostCompliedFile', () => new Object())

  startCommand
    .stub(project, 'startCompile', (...args: any[]) => {
      args?.[3]?.();
    })
    .command(['start'])
    .it('start first success', ctx => {
      expect(ctx.stdout).to.equals(
        '************************\n' +
        'Current packageID: wpkDeveloper\n' +
        'Copy the following address and paste it into the developing widget container:\n' +
        'https://localhost:9000/widget_bundle.js\n' +
        '************************\n'
      );
    });

  startCommand
    .stub(project, 'startCompile', (...args: any[]) => {
      args?.[3]?.();
      args?.[3]?.();
    })
    .command(['start'])
    .it('repeat compile', ctx => {
      expect(ctx.stdout).to.equals(
        '************************\n' +
        'Current packageID: wpkDeveloper\n' +
        'Copy the following address and paste it into the developing widget container:\n' +
        'https://localhost:9000/widget_bundle.js\n' +
        '************************\n' +
        'Code has been recompiled\n' +
        'https://localhost:9000/widget_bundle.js\n'
      );
    });
});
