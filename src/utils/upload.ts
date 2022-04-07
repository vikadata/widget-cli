import axios from 'axios';
import { IApiWrapper } from '../interface/api';
import { form_up } from 'qiniu';

export const getUploadToken = async({
  packageId,
  auth
}: {
  packageId: string;
  auth: { host: string, token: string }
}) => {
  const { host, token } = auth;
  const result = await axios.post<IApiWrapper<{
    uploadToken: string;
    resourceKey: string;
  }>>(`/asset/widgets/${packageId}/uploadToken`, { prefixalScope: 1 }, {
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
    baseURL: `${host}/api/v1`,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!result.data.success) {
    throw new Error(`${result.data.message} code: ${result.data.code}`);
  }
  return result.data.data;
};

export const uploadFile = (uploadToken: string, resourceKey: string, fileName: string, url: string) => {
  const formUploader = new form_up.FormUploader();
  const putExtra = new form_up.PutExtra();
  return new Promise<void>((resolve)=> {
    formUploader.putFile(uploadToken, resourceKey + fileName, url, putExtra, (respErr, respBody, respInfo) => {
      if (respErr) {
        throw respErr;
      }
      if (respInfo.statusCode !== 200) {
        throw new Error(`${respBody} code: ${respInfo.statusCode}`);
      }
      resolve();
    });
  });
};
