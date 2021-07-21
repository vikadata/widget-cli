export const kebab2camel = (s: string) => s.replace(/-./g, x => x.toUpperCase()[1]);
