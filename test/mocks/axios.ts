import { axiosResponseWrap } from '../tools';
import { widgetPackageInfo } from './package_info';

export const releaseAxios: any = async(url: string) => {
  if (url.includes('/widget/package/v2/release')) {
    return axiosResponseWrap();
  }
  if (url.includes('/widget/package/create')) {
    return axiosResponseWrap({ packageId: 'wpkDeveloper' });
  }
  if (url.includes('/widget/package/')) {
    const packageId = url.split('/')?.pop();
    return axiosResponseWrap(widgetPackageInfo.packageId === packageId ? widgetPackageInfo : null);
  }
  return null;
};

export const submitAxios: any = async(url: string) => {
  if (url.includes('/widget/package/v2/submit')) {
    return axiosResponseWrap();
  }
  if (url.includes('/widget/package/create')) {
    return axiosResponseWrap({ packageId: 'wpkDeveloper' });
  }
  if (url.includes('/widget/package/')) {
    const packageId = url.split('/')?.pop();
    return axiosResponseWrap(widgetPackageInfo.packageId === packageId ? widgetPackageInfo : null);
  }
  return null;
};
