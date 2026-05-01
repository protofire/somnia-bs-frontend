import * as cookies from 'lib/cookies';

import { getEnvValue } from './utils';

const appPort = getEnvValue('NEXT_PUBLIC_APP_PORT');
const appSchema = getEnvValue('NEXT_PUBLIC_APP_PROTOCOL');
const appHost = getEnvValue('NEXT_PUBLIC_APP_HOST');
const baseUrl = [
  appSchema || 'https',
  '://',
  appHost,
  appPort && ':' + appPort,
].filter(Boolean).join('');
const isDev = getEnvValue('NEXT_PUBLIC_APP_ENV') === 'development';
const isReview = getEnvValue('NEXT_PUBLIC_APP_ENV') === 'review';
const isPw = getEnvValue('NEXT_PUBLIC_APP_INSTANCE') === 'pw';
const spriteHash = getEnvValue('NEXT_PUBLIC_ICON_SPRITE_HASH');
const blockExplorerUrl = getEnvValue('NEXT_PUBLIC_BLOCK_EXPLORER_URL') || getEnvValue('NEXT_PUBLIC_APP_HOST');
const isPrivateMode = cookies.get(cookies.NAMES.APP_PROFILE) === 'private';

const app = Object.freeze({
  isDev,
  isReview,
  isPw,
  protocol: appSchema || 'https',
  host: appHost,
  port: appPort,
  baseUrl,
  useProxy: getEnvValue('NEXT_PUBLIC_USE_NEXT_JS_PROXY') === 'true',
  spriteHash,
  blockExplorerUrl: blockExplorerUrl as string,
  isPrivateMode,
});

export default app;
