import { expect, test } from '@oclif/test';
import axios from 'axios';
import { axiosResponseWrap } from '../tools';

describe('rollback command', () => {
  test
    .stdout()
    .stub(axios, 'post', async() => axiosResponseWrap(''))
    .command(['rollback', '--token=token', '--host=origin', '--packageId=wpkDeveloper', '0.0.1'])
    .it('rollback success', ctx => {
      expect(ctx.stdout).to.equal('Rollback version to 0.0.1\n\n');
    });
});
