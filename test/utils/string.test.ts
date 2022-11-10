import { expect } from 'chai';
import { kebab2camel, wrapOutput } from '../../src/utils/string';

describe('utils string module', () => {
  it('kebab2camel', () => {
    expect(kebab2camel('my-widget')).to.equal('myWidget');
  });

  it('wrapOutput', () => {
    const maxLine = 10;
    const str = 'this is a widget';
    const arr = wrapOutput(str, maxLine).split('\n');
    expect(arr.length).to.equal(Math.ceil(str.length / maxLine));
  });
});

