export interface IWidgetConfig {
  /** [只读] 小程序代码包的 Id，初始化时自动生成 */
  packageId: string;
  /** [只读] 全局小程序代码包的 Id，发布到全局时自动生成 */
  globalPackageId?: string;
  /** 空间站 ID，小程序必须绑定一个空间站 */
  spaceId: string;
  /** 小程序代码版本，固定三位版本号，每次发布时需要进行更新，请遵循 semver 原则进行更新 */
  version: string;
  /** 小程序代码入口, 支持 js 和 ts */
  entry: string;
  /** 小程序名称，显示在小程序安装界面 */
  name: {[key: string]: string};
  /** 小程序图标路径，发布时自动上传，显示在小程序安装界面, 请使用 64x64 png 文件 */
  icon: string;
  /** 小程序封面图，发布时自动上传，显示在小程序安装界面, 请使用 16:9 的图片，推荐使用 640 × 360 的 png 或 jpg 文件 */
  cover: string;
  /** 作者名称，显示在小程序安装界面 */
  authorName: string;
  /** 作者图标路径，发布时自动上传，显示在小程序安装界面, 请使用 64x64 png 文件 */
  authorIcon: string;
  /** [可选] 作者地址，点击作者图标后跳转 */
  authorLink: string;
  /** [可选] 作者 邮件地址 */
  authorEmail: string;
  /** 小程序描述，显示在小程序安装界面 */
  description: {[key: string]: string};
  /** [可选] 小程序渲染是否启用 iframe 模式 */
  sandbox?: boolean;
  /** 小程序主页 */
  website?: string;
  /** 安装环境 */
  installEnv?: string[];
  /** 运行环境 */
  runtimeEnv?: string[];
}
