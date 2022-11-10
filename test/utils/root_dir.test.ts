import { findWidgetRootDir } from '../../src/utils/root_dir';
import * as findUp from 'find-up';
import { buildRootDir } from '../const';
import { expect } from 'chai';

const sinon = require('sinon');

describe('utils root_dir module', () => {
  it('findWidgetRootDir', () => {
    const rootDir = findUp.sync('test/fixtures/build/widget.config.json', {
      cwd: process.cwd(),
    });
    sinon.stub(findUp, 'sync').callsFake(() => {
      return rootDir;
    });
    expect(findWidgetRootDir()).contains(buildRootDir);
    sinon.restore();
    expect(() => findWidgetRootDir()).to.throw();
  });
});

