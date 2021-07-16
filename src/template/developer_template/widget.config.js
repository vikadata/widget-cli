/* eslint-disable */
module.exports = {
  /** [只读] 小组件代码包的 Id，初始化时自动生成 */
  packageId: 'wpkDeveloper',
  /** 小组件代码版本，固定三位版本号，每次发布时需要进行更新，请遵循 semver 原则进行更新 */
  version: '0.1.0',
  /** api token 小组件初始化时会进行绑定，该 token 拥有后续更新权 */
  authToken: 'your api token',
  /** 小组件代码入口, 支持 js 和 ts */
  entry: './src/index.ts',
  /** 小组件名称，显示在小组件安装界面 */
  name: {
    zh_CN: '图表（Chart）',
    en_US: 'Chart',
  },
  /** 小组件英文名称，非中文语言配置下显示在小组件安装界面 */
  nameEn: 'chart',
  /** 小组件图标路径，发布时自动上传，显示在小组件安装界面, 请使用 64x64 png 文件*/
  icon: './package_icon.png',
  /** 小组件封面图，发布时自动上传，显示在小组件安装界面, 请使用 16:9 的图片，推荐使用 640 × 360 的 png 或 jpg 文件 */
  cover: './package_icon.png',
  /** 作者名称，显示在小组件安装界面 */
  authorName: 'vika',
  /** 作者图标路径，发布时自动上传，显示在小组件安装界面, 请使用 64x64 png 文件*/
  authorIcon: './author_icon.png',
  /** [可选] 作者地址，点击作者图标后跳转 */
  authorUrl: 'https://developer.vika.cn',
  /** 小组件描述，显示在小组件安装界面 */
  description: {
    zh_CN: '可以将表格内的数据可视化为柱状图、条形图、折线图、散点图、饼状图等展示形式。你可以通过图表直观地了解数据的概览情况，方便你做决策分析和会议汇报。',
    en_US: 'The data in the table can be visualized into display forms such as bar graphs, bar graphs, line graphs, scatter graphs, and pie graphs. You can intuitively understand the overview of the data through the chart, which is convenient for you to make decision analysis and meeting reports.',
  }
};
