export interface IApiWrapper<T = any> {
  code: number;
  message: string;
  success: boolean;
  data: T;
}
