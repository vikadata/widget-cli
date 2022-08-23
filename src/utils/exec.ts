import { exec } from 'child_process';
import { findWidgetRootDir } from './root_dir';

export function asyncExec(cmd: string, destDir?: string) {
  destDir = destDir ?? findWidgetRootDir();
  return new Promise((resolve, reject) => {
    exec(cmd, { cwd: destDir }, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      }

      if (stderr) {
        console.error(stderr);
        return;
      }

      console.log(stdout);
      resolve(undefined);
    });
  });
}
