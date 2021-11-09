import * as DictEnum from './api_dict_enum';

export interface IDict {
  value: number | string;
  label: string;
}

export const releaseStatusMapping: IDict[] = [
  { value: DictEnum.EReleaseStatus.WAIT_REVIEW, label: 'Wait Review' },
  { value: DictEnum.EReleaseStatus.PASS_REVIEW, label: 'Pass Review' },
  { value: DictEnum.EReleaseStatus.REJECT, label: 'Reject' }
];

export const widgetStatusMapping: IDict[] = [
  { value: DictEnum.EWidgetStatus.DEVELOP, label: 'Develop' },
  { value: DictEnum.EWidgetStatus.BANNED, label: 'Banned' },
  { value: DictEnum.EWidgetStatus.UNPUBLISHED, label: 'Unpublished' },
  { value: DictEnum.EWidgetStatus.ONLINE, label: 'Online' },
  { value: DictEnum.EWidgetStatus.UNPUBLISH, label: 'Offline' }
];

export const packageTypeMapping: IDict[] = [
  { value: DictEnum.EPackageType.THIRD_PARTY, label: 'Third Party' },
  { value: DictEnum.EPackageType.OFFICIAL, label: 'Official' }
];

export const releaseTypeMapping: IDict[] = [
  { value: DictEnum.EReleaseType.SPACE, label: 'Space' },
  { value: DictEnum.EReleaseType.GLOBAL, label: 'Global' }
];
