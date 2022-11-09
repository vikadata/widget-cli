import { expect } from 'chai';
import { generateRandomId, generateRandomString } from '../../src/utils/id';

describe('utils id module', () => {
  it('generateRandomString', () => {
    const set = new Set<string>();
    const count = 10;
    const stringLen = 20;
    for(let i = 0; i < count; i++) {
      set.add(generateRandomString(stringLen));
    }
    expect(set.size).to.equal(count);
    expect([...set][0].length).to.equal(stringLen);
  });

  it('generateRandomId', () => {
    const prefix = 'wpk';
    const str = generateRandomId(prefix, 10);
    expect(str.length).to.equal(prefix.length + 10);
    expect(str.startsWith(prefix)).to.equal(true);
  });
});
