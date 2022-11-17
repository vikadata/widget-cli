import { expect } from 'chai';
import cli from 'cli-ux';
import Config from '../../src/config';
import { buildRootDir } from '../const';
import * as uploadModule from '../../src/utils/upload';
import * as rootDirModule from '../../src/utils/root_dir';
import * as projectModule from '../../src/utils/project';
import { uploadPackageBundle, uploadPackageAssets, checkVersion, increaseVersion } from '../../src/utils/release';

const sinon = require('sinon');

describe('utils release module', () => {
  beforeEach(() => {
    sinon.restore();
    // avoid necessary log
    sinon.stub(cli.action, 'start').callsFake(() => {
      return () => {};
    });sinon.stub(cli.action, 'stop').callsFake(() => {
      return () => {};
    });
  });

  it('uploadPackageBundle', async() => {
    sinon.stub(rootDirModule, 'findWidgetRootDir').callsFake(() => {
      return buildRootDir;
    });
    sinon.stub(uploadModule, 'uploadPackage').callsFake(async() => {
      return ['releaseCodeBundleToken'];
    });

    const releaseCodeBundle = Config.releaseCodePath + Config.releaseCodeProdName;
    const [releaseCodeBundleToken, sourceCodeBundleToken] = await uploadPackageBundle(
      { releaseCodeBundle: releaseCodeBundle },
      { packageId: 'wpkDeveloper', version: '0.0.1' },
      { host: 'host', token: 'token' }
    );
    expect(releaseCodeBundleToken).to.equal('releaseCodeBundleToken');
    expect(sourceCodeBundleToken).to.equal(undefined);
  });

  it('uploadPackageAssets', async() => {
    sinon.stub(rootDirModule, 'findWidgetRootDir').callsFake(() => {
      return buildRootDir;
    });
    sinon.stub(uploadModule, 'uploadPackage').callsFake(async() => {
      return ['iconToken', 'coverToken', 'authorIconToken'];
    });
    const [iconToken, coverToken, authorIconToken] = await uploadPackageAssets(
      { icon: './icon.png', cover: './cover.png', authorIcon: './author_icon.png' },
      { packageId: 'wpkDeveloper', version: '0.0.1' },
      { host: 'host', token: 'token' }
    );
    expect(iconToken).to.equal('iconToken');
    expect(coverToken).to.equal('coverToken');
    expect(authorIconToken).to.equal('authorIconToken');
  });

  it('checkVersion', () => {
    sinon.stub(console, 'error').callsFake(async() => {});
    const res1 = checkVersion('0.0.1', '0.0.2');
    expect(res1).to.equal(false);
    const res2 = checkVersion('0.0.3', '0.0.2');
    expect(res2).to.equal(true);
    const res3 = checkVersion('123123', '0.0.2');
    expect(res3).to.equal(false);
  });

  it('increaseVersion', () => {
    expect(() => increaseVersion()).to.throw();
    sinon.stub(projectModule, 'getVersion').callsFake(() => {
      return '0.0.1';
    });
    expect(increaseVersion()).to.equal('0.0.2');
  });
});

