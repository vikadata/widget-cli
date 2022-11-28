import { expect, test } from '@oclif/test';
import axios from 'axios';
import cli from 'cli-ux';
import { axiosResponseWrap } from '../tools';

describe('ban command', () => {
  const preStdout = 'Ban widget package: --packageId=wpkDeveloper\n';
  const testBan = (confirm: Boolean) => test
    .stdout()
    .stub(cli, 'confirm', () => async() => confirm)
    .stub(axios, 'post', async() => axiosResponseWrap(null, { message: 'Ban success' }))
    .command(['ban', '--token=token', '--host=origin', '--packageId=wpkDeveloper']);

  testBan(true)
    .it('ban confirm', ctx => {
      expect(ctx.stdout).to.equal(`${preStdout}Ban success\n`);
    });

  testBan(false)
    .it('ban no confirm', ctx => {
      expect(ctx.stdout).to.equal(`${preStdout}canceled\n`);
    });
});
