/**
 * 发布状态
 */
export enum EReleaseStatus {
  WAIT_REVIEW, // 待审核
  PASS_REVIEW, // 审核通过
  REJECT, // 已拒绝
}

/**
 * 组件状态
 */
export enum EWidgetStatus {
  DEVELOP, // 开发中
  BANNED, // 已封禁
  UNPUBLISHED, // 待发布
  ONLINE, // 已发布
  UNPUBLISH, // 已下架
}

/**
 * 包类型
 */
export enum EPackageType {
  THIRD_PARTY, // 第三方
  OFFICIAL, // 官方
}

/**
 * 发布类型
 */
export enum EReleaseType {
  SPACE, // 空间站
  GLOBAL, // 全局
}

/**
 * upload asset type
 */
export enum EFileType {
  ASSET,
  PACKAGE,
  PACKAGE_CONFIG
}
