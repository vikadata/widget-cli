import cli from 'cli-ux';

export async function hostPrompt(host?: string): Promise<string> {
  if (!host) {
    host = await cli.prompt('Host of the server', { default: 'https://vika.cn' });
  }
  if (host && host[host?.length - 1] === '/') {
    host = host?.slice(0, -1);
  }
  return host!;
}

export async function tokenPrompt(token: string): Promise<string> {
  if (!token) {
    token = await cli.prompt('Your API Token', { required: true, type: 'mask' });
  }
  return token!;
}
