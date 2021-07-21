const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

export function generateRandomString(length = 20): string {
  let randomString = '';
  const size = chars.length;
  for (let i = 0; i < length; i++) {
    const randomNumber = Math.floor(Math.random() * size);
    randomString += chars[randomNumber];
  }
  return randomString;
}

export function generateRandomId(prefix: string, randomLength: number) {
  return prefix + generateRandomString(randomLength);
}
