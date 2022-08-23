import { EUploadType } from './api_dict_enum';

export interface IApiWrapper<T = any> {
  code: number;
  message: string;
  success: boolean;
  data: T;
}

export interface IApiUploadAuth {
  uploadToken: string;
  resourceKey: string;
  uploadType: EUploadType;
  endpoint: string;
}
