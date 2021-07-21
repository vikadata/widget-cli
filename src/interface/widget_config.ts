export interface IWidgetConfig {
  /** [只读] 小组件代码包的 Id，初始化时自动生成 */
  packageId: string;
  /** [只读] 全局小组件代码包的 Id，发布到全局时自动生成 */
  globalPackageId?: string;
  /** 空间站 ID，小组件必须绑定一个空间站 */
  spaceId: string;
  /** 小组件代码版本，固定三位版本号，每次发布时需要进行更新，请遵循 semver 原则进行更新 */
  version: string;
  /** 小组件代码入口, 支持 js 和 ts */
  entry: string;
  /** 小组件名称，显示在小组件安装界面 */
  name: {[key: string]: string};
  /** 小组件图标路径，发布时自动上传，显示在小组件安装界面, 请使用 64x64 png 文件 */
  icon: string;
  /** 小组件封面图，发布时自动上传，显示在小组件安装界面, 请使用 16:9 的图片，推荐使用 640 × 360 的 png 或 jpg 文件 */
  cover: string;
  /** 作者名称，显示在小组件安装界面 */
  authorName: string;
  /** 作者图标路径，发布时自动上传，显示在小组件安装界面, 请使用 64x64 png 文件 */
  authorIcon: string;
  /** [可选] 作者地址，点击作者图标后跳转 */
  authorLink: string;
  /** 小组件描述，显示在小组件安装界面 */
  description: {[key: string]: string};
}
