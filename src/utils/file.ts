import axios from 'axios';
import * as fse from 'fs-extra';
import * as FormData from 'form-data';
import { getPrivateConfig } from './project';
import { IApiWrapper } from '../interface/api';
import Vika from '@vikadata/vika';

export function readableFileSize(size: number) {
  const i = Math.floor(Math.log(size) / Math.log(1024));
  // eslint-disable-next-line no-mixed-operators
  return Number((size / 1024 ** i).toFixed(2)) + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i];
}

// todo: buggy
export async function uploadFile(filePath: string): Promise<IApiWrapper<{url: string; token: string}>> {
  const file = fse.createReadStream(filePath);
  const form = new FormData();
  form.append('file', file as any);
  const { host, token } = getPrivateConfig();

  return axios.request({
    baseURL: host + '/fusion/v1',
    url: '/datasheets/dstuVwAR8LSdWJKcFX/attachments',
    method: 'post',
    data: form,
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: 'Bearer ' + token,
      ...form.getHeaders()
    },
  }).then(res => res.data);
}

export async function uploadFileVika(filePath: string) {
  const file = fse.createReadStream(filePath);
  const { host, token } = getPrivateConfig();
  const vika = new Vika({ token: token!, host: host + '/fusion/v1' });
  return vika.datasheet('dstuVwAR8LSdWJKcFX').upload(file);
}
