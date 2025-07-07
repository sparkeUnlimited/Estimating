import crypto from 'crypto';

const SECRET = process.env.AUTH_SECRET || 'change-me';

export function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(':');
  const computed = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return hash === computed;
}

export function signToken(payload: object) {
  const data = JSON.stringify(payload);
  const sig = crypto.createHmac('sha256', SECRET).update(data).digest('hex');
  return `${Buffer.from(data).toString('base64')}.${sig}`;
}

export function verifyToken(token: string) {
  const [dataB64, sig] = token.split('.');
  if (!dataB64 || !sig) return null;
  const data = Buffer.from(dataB64, 'base64').toString('utf8');
  const expected = crypto.createHmac('sha256', SECRET).update(data).digest('hex');
  if (expected !== sig) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}
