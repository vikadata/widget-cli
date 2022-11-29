export enum EReleaseStatus {
  WAIT_REVIEW,
  PASS_REVIEW,
  REJECT,
}

export enum EWidgetStatus {
  DEVELOP,
  BANNED,
  UNPUBLISHED, // wait publish
  ONLINE, // published
  UNPUBLISH, // had withdrawn
}

export enum EPackageType {
  THIRD_PARTY,
  OFFICIAL,
}

export enum EReleaseType {
  SPACE,
  GLOBAL,
}

/**
 * upload asset type
 */
export enum EFileType {
  ASSET,
  PACKAGE,
  PACKAGE_CONFIG
}
