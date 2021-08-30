import cli from 'cli-ux';
import * as Parser from '@oclif/parser';
import { getPrivateConfig, getWidgetConfig } from './project';

export async function hostPrompt(host?: string): Promise<string> {
  if (!host) {
    host = await cli.prompt('Host of the server', { default: 'https://vika.cn' });
  }
  if (host && host[host?.length - 1] === '/') {
    host = host?.slice(0, -1);
  }
  return host!;
}

export async function tokenPrompt(token?: string): Promise<string> {
  if (!token) {
    token = await cli.prompt('Your API Token', { required: true, type: 'mask' });
  }
  return token!;
}

export async function packageIdPrompt(packageId?: string): Promise<string> {
  if (packageId) {
    return packageId;
  }

  const widgetConfig = getWidgetConfig();
  packageId = global ? widgetConfig.globalPackageId : widgetConfig.packageId;

  if (!packageId) {
    packageId = await cli.prompt('Your API Token', { required: true, type: 'mask' });
  }
  return packageId!;
}

/**
 * Return packageId/host/token in widgetConfig or prompt it
 * if user specify packageId, use the packageId
 *   else
 *      if user not specify packageId, use packageId in widgetConfig
 *      if user run in --global mode, use globalPackageId in widgetConfig
 * if use specify host and token, use them
 *   else use host and token in privateConfig 
 */
export async function autoPrompt(
  parsed: Parser.Output<any, any>
):Promise<{ packageId: string, host: string, token: string, global: boolean }> {
  let { args: { packageId }, flags: { host, token, global }} = parsed;

  if (!packageId) {
    const authConfig = getPrivateConfig();
    const widgetConfig = getWidgetConfig();
    token = authConfig.token!;
    host = authConfig.host!;
    packageId = global ? widgetConfig.globalPackageId : widgetConfig.packageId;
  } else {
    host = await hostPrompt(host);
    token = await tokenPrompt(token);
  }

  return {
    packageId,
    host,
    token,
    global: Boolean(global),
  };
}
