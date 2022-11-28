import { expect, test } from '@oclif/test';
import axios from 'axios';
import * as projectMethods from '../../src/utils/project';
import { axiosResponseWrap } from '../tools';

describe('auth command', () => {
  test
    .stdout()
    .stub(axios, 'post', async() => axiosResponseWrap())
    .stub(projectMethods, 'updatePrivateConfig', () => {})
    .command(['auth', '--token=token', '--host=origin'])
    .it('auth success', ctx => {
      expect(ctx.stdout).to.equal('Authorize succeed!\n');
    });
});
