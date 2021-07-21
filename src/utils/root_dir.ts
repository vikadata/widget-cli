import * as findUp from 'find-up';
import * as path from 'path';
import Config from '../config';

// The directory where where widget.config.json is located is widget project root dir
export function findWidgetRootDir() {
  const configPath = findUp.sync(Config.widgetConfigFileName, {
    cwd: process.cwd(),
  });

  if (configPath) {
    return path.join(configPath, '../');
  }
  throw new Error(`Can not find ${Config.widgetConfigFileName} , You should run command in your widget project.`);
}
