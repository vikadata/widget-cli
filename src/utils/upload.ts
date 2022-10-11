import axios, { AxiosRequestConfig, Method } from 'axios';
import * as fse from 'fs-extra';
import { IApiWrapper } from '../interface/api';
import { IUploadAuth, IUploadAuthProps, IUploadMeta, IUploadNotifyProps, IUploadPackageProps } from '../interface/upload';

// the maximum number of tokens that can be obtained at one time
export const MAX_TOKEN_COUNT = 20;

/**
 * get the meta needed for upload and complier
 * @param host
 * @returns
 */
export const getUploadMeta = async({ token, host }: { token: string; host: string}) => {
  const result = await axios.post<IApiWrapper<IUploadMeta>>('/asset/widget/uploadMeta', {}, {
    baseURL: `${host}/api/v1`,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const { success, message, data, code } = result.data;
  if (!success) {
    throw new Error(`${message} code: ${code}`);
  }
  return data;
};

/**
 * get the auth needed for upload
 * @param param0
 * @returns
 */
export const getUploadAuth = async({
  packageId,
  auth,
  opt
}: IUploadAuthProps) => {
  const { host, token } = auth;
  const result = await axios.post<IApiWrapper<IUploadAuth[]>>(`/asset/widget/${packageId}/uploadPreSignedUrl`, opt, {
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

/**
 * single file upload
 * @param file
 * @param uploadAuth
 * @param axiosConfig
 */
export const uploadFile = async(file: fse.ReadStream, uploadAuth: IUploadAuth, axiosConfig?: AxiosRequestConfig | undefined) => {
  const { uploadRequestMethod, uploadUrl } = uploadAuth;
  const requestMethod = String(uploadRequestMethod).toLowerCase();
  await axios({
    url: uploadUrl,
    method: requestMethod as Method,
    data: file,
    ...axiosConfig,
  });
};

/**
 * notify after upload success
 * @param param0
 * @returns
 */
export const uploadNotify = async({ opt, auth }: IUploadNotifyProps) => {
  const { host, token } = auth;
  const result = await axios.post<IApiWrapper<IUploadAuth>>('/asset/widget/uploadCallback', opt, {
    baseURL: `${host}/api/v1`,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!result.data.success) {
    throw new Error(`${result.data.message} code: ${result.data.code}`);
  }
  return;
};

/**
 * upload package type file
 * example: icon,cover,bundle
 * @param param0
 * @returns
 */
export const uploadPackage = async({ auth, opt, files }: IUploadPackageProps) => {
  const len = files?.length;
  if (!len) {
    throw new Error('files is empty');
  }
  if (len > MAX_TOKEN_COUNT) {
    throw new Error('Maximum package config file limit exceeded');
  }
  const { packageId, type, version } = opt;
  const uploadAuth = await getUploadAuth({
    packageId,
    auth,
    opt: {
      count: files.length,
      fileType: type,
      version
    }
  });
  const allPromise: Promise<void>[] = [];
  files.forEach((file, i) => {
    allPromise.push(uploadFile(file, uploadAuth[i]));
  });
  await Promise.all(allPromise);
  const tokenArray = uploadAuth.map(v => v.token);
  await uploadNotify({ auth, opt: { resourceKeys: tokenArray }});
  return tokenArray;
};
