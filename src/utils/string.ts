export const kebab2camel = (s: string) => s.replace(/-./g, x => x.toUpperCase()[1]);

export const wrapOutput = (s: string, strLength?: number) => {
    strLength = strLength || 10;
    const regObj = new RegExp(/[^\x00-\xff]/, 'g');
    const regObj1 = new RegExp('.{' + strLength + '}\\x01?', 'g');
    const regObj2 = new RegExp(/\x01/, 'g');
    return s.replace(regObj, '$&\x01').replace(regObj1, '$&\n').replace(regObj2, '');
};