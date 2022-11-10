import { expect, test } from '@oclif/test';
import axios from 'axios';
import * as projectMethods from '../../src/utils/project';

describe('auth command', () => {
  test
    .stdout()
    .stub(axios, 'post', () => {
      return Promise.resolve({ data: { success: true }});
    })
    .stub(projectMethods, 'updatePrivateConfig', () => {})
    .command(['auth', '--token=token', '--host=origin'])
    .it('widget-cli auth', ctx => {
      expect(ctx.stdout).to.equal('Authorize succeed!\n');
    });
});
