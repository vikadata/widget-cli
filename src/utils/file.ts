export function readableFileSize(size: number) {
  const i = Math.floor(Math.log(size) / Math.log(1024));
  // eslint-disable-next-line no-mixed-operators
  return Number((size / 1024 ** i).toFixed(2)) + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i];
}
