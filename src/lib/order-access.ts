import { createHash, randomBytes } from 'node:crypto';

const ORDER_ACCESS_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export function createOrderAccessToken() {
  const token = randomBytes(32).toString('base64url');
  return {
    token,
    hash: hashOrderAccessToken(token),
    expiresAt: new Date(Date.now() + ORDER_ACCESS_TTL_MS),
  };
}

export function hashOrderAccessToken(token: string): string {
  return createHash('sha256').update(token, 'utf8').digest('hex');
}

export function isValidOrderAccessToken(token: unknown): token is string {
  return typeof token === 'string' && /^[A-Za-z0-9_-]{43}$/.test(token);
}
