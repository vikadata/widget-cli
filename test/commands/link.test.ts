import { expect, test } from '@oclif/test';

describe('link command', () => {
  test
    .stdout()
    .command(['link'])
    .it('link not support', ctx => {
      expect(ctx.stdout).to.equal(
        'This command is developing, you can init a new widget to\n' +
        'the space that you want to transform to, then copy the source code from existing widget and release it\n'
      );
    });
});
