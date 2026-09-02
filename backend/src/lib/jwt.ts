import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'dev-access-secret-change-me';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-change-me';

export type AccessPayload = { sub: string; role: string };

export function signAccessToken(payload: AccessPayload): string {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: '15m' });
}

export function verifyAccessToken(token: string): AccessPayload {
  return jwt.verify(token, ACCESS_SECRET) as AccessPayload;
}

export function generateRefreshToken(): string {
  // Opaque random string stored in DB (revocable)
  return crypto.randomBytes(48).toString('hex');
}

export function refreshTokenExpiry(): Date {
  return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
}
