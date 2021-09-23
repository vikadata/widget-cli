import { Command } from '@oclif/command';
import * as chalk from 'chalk';

export default class Link extends Command {
  static description = 'Link a space widget to another space (developing)';

  static hidden = true;

  static examples = [
    `$ widget-cli link
Succeed!
`,
  ];

  async run() {
    this.log(chalk.greenBright(`This command is developing, you can init a new widget to
the space that you want to transform to, then copy the source code from existing widget and release it`));
  }
}
