import { expect, test } from '@oclif/test';
import axios from 'axios';
import { widgetPackageInfo } from '../mocks/package_info';
import { axiosResponseWrap } from '../tools';

describe('unpublish command', () => {
  test
    .stdout()
    .stub(axios, 'post', async() => axiosResponseWrap())
    .stub(axios, 'get', async() => axiosResponseWrap(widgetPackageInfo))
    .command(['unpublish', '--token=token', '--host=origin', '--noConfirm', 'wpkDeveloper'])
    .it('unpublish success', ctx => {
      // eslint-disable-next-line max-len
      expect(ctx.stdout).to.equal('=== Package Details ===\npackageId      wpkDeveloper\nname           widget\nicon           icon.png\ncover          cover.png\ndescription    description\nversion        0.0.1\nstatus         3\nauthorName     author\nauthorIcon     author.png\nauthorEmail    dev@xxxx.com\nauthorLink     https://github.com/\npackageType    0\nreleaseType    0\nUnpublish succeed!\n');
    });
});
