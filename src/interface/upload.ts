import { EFileType } from './api_dict_enum';
import * as fse from 'fs-extra';

export interface IUploadAuthProps {
  packageId: string;
  auth: {
    host: string;
    token: string
  };
  opt: {
    version?: string;
    count?: number;
    fileType: EFileType;
    filenames?: string[];
  }
}

export interface IUploadAuth {
  token: string;
  uploadRequestMethod: string;
  uploadUrl: string;
}

export interface IUploadMeta {
  endpoint: string;
}

export interface IUploadNotifyProps {
  auth: {
    host: string;
    token: string
  };
  opt: {
    resourceKeys: string[];
  }
}

export interface IUploadPackageProps {
  files?: fse.ReadStream[];
  auth: {
    host: string;
    token: string
  };
  opt: {
    packageId: string;
    type: EFileType;
    version: string;
  }
}
