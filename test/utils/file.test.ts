import { expect } from 'chai';
import { AssetsType } from '../../src/enum';
import { getAssetsType, isImages, readableFileSize, viaFileLoader } from '../../src/utils/file';

describe('utils file module', () => {
  it('readableFileSize', () => {
    expect(readableFileSize(1)).to.equal('1 B');
    expect(readableFileSize(1024)).to.equal('1 kB');
  });

  it('isImages', () => {
    expect(isImages('file.png')).to.equal(true);
    expect(isImages('file.txt')).to.equal(false);
  });

  it('viaFileLoader', () => {
    expect(viaFileLoader('file.png')).to.equal(true);
    expect(isImages('file.txt')).to.equal(false);
  });

  it('getAssetsType', () => {
    expect(getAssetsType('file.png')).to.equal(AssetsType.Images);
    expect(getAssetsType('file.txt')).to.equal(undefined);
  });
});
