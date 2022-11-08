import { expect } from 'chai';
import { readableFileSize } from '../../src/utils/file';

describe('files readableFileSize', () => {
  expect(readableFileSize(1)).to.equal('1 B');
});
