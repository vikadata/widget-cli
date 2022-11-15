interface IExtra {
  message?: string;
  success?: boolean;
}
export const axiosResponseWrap = (data: any = null, extra?: IExtra) => {
  const { message = '', success = true } = extra || {};
  return {
    data: {
      data,
      message,
      success
    }
  };
};
