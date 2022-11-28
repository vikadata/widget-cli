import { expect, test } from '@oclif/test';
import axios from 'axios';
import { mockListRelease } from '../mocks/list_release';
import { widgetPackageInfo } from '../mocks/package_info';
import { axiosResponseWrap } from '../tools';

describe('list-release command', () => {
  const testListReleaseCommand = test
    .stdout();
  const commandArgs = ['list-release', '--token=token', '--host=origin', 'wpkDeveloper'];

  testListReleaseCommand
    .stub(axios, 'get', async function listReleaseAxios(url: string) {
      if (url.includes('/widget/package/release/history/')) {
        return axiosResponseWrap(mockListRelease);
      }
      return axiosResponseWrap(widgetPackageInfo);
    } as any)
    .command(commandArgs)
    .it('release info', ctx => {
      // eslint-disable-next-line max-len
      expect(ctx.stdout).to.equal('=== Package Details ===\npackageId:     wpkDeveloper\nname:          widget\nicon:          icon.png\ncover:         cover.png\ndescription:   description\nversion:       0.0.1\nstatus:        Online\nauthorName:    author\nauthorIcon:    author.png\nauthorEmail:   dev@xxxx.com\nauthorLink:    https://github.com/\npackageType:   Third Party\nreleaseType:   Space\n\n=== Package Release Details ===\n Releasesha                               Version          Releasecodebundle Sourcecodebundle Status      \n ──────────────────────────────────────── ──────────────── ───────────────── ──────────────── ─────────── \n df39dcb351260b21a5445c5eabce6ca5efee1521 0.0.1            bundle.js         No data          Pass Review \n 5ddb41e847b066554f8fd3e1a9afb61325a26f54 0.0.2（current） bundle.js         No data          Pass Review \n');
    });

  testListReleaseCommand
    .stub(axios, 'get', async() => axiosResponseWrap(null))
    .command(commandArgs)
    .it('packageId non-existent', ctx => {
      expect(ctx.stdout).to.equal('packageId: wpkDeveloper not exist\n');
    });
});
