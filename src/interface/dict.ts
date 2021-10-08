import { IDict } from './api_dict_mapping';

export const translate = (mapping: IDict[], val: number | string) => {
    const dict = mapping.find(dict => dict.value === val);
    return dict ? dict.label : val;
}