import { Router } from 'express';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { signAccessToken, generateRefreshToken, refreshTokenExpiry } from '../lib/jwt.js';
import { AccountKind } from '@prisma/client';

const router = Router();

const registerSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(8, 'Almeno 8 caratteri'),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  city: z.string().min(1),
  zipCode: z.string().min(3),
  accountKind: z.nativeEnum(AccountKind).default(AccountKind.BOTH),
  acceptedCodeOfCare: z.literal(true, {
    errorMap: () => ({ message: 'Devi accettare il Codice di Cura' }),
  }),
});

const loginSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(1),
});

function setRefreshCookie(res: import('express').Response, token: string) {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000,
    path: '/api/auth',
  });
}

// POST /api/auth/register
router.post('/register', async (req, res, next) => {
  try {
    const input = registerSchema.parse(req.body);

    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing) {
      return res.status(409).json({ error: 'Esiste già un account con questa email' });
    }

    const passwordHash = await bcrypt.hash(input.password, 10);

    const user = await prisma.user.create({
      data: {
        email: input.email,
        passwordHash,
        accountKind: input.accountKind,
        acceptedCodeOfCareAt: new Date(),
        // NOTE: in production, set emailVerifiedAt only after email confirmation
        emailVerifiedAt: new Date(),
        profile: {
          create: {
            firstName: input.firstName,
            lastName: input.lastName,
            city: input.city,
            zipCode: input.zipCode,
          },
        },
      },
      include: { profile: true },
    });

    const refreshToken = generateRefreshToken();
    await prisma.session.create({
      data: {
        userId: user.id,
        refreshToken,
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip,
        expiresAt: refreshTokenExpiry(),
      },
    });

    const accessToken = signAccessToken({ sub: user.id, role: user.role });
    setRefreshCookie(res, refreshToken);

    res.status(201).json({
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        accountKind: user.accountKind,
        profile: user.profile,
      },
    });
  } catch (e) {
    next(e);
  }
});

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const input = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email: input.email },
      include: { profile: true },
    });
    if (!user) return res.status(401).json({ error: 'Credenziali non valide' });
    if (user.suspended) return res.status(403).json({ error: 'Account sospeso' });

    const ok = await bcrypt.compare(input.password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Credenziali non valide' });

    const refreshToken = generateRefreshToken();
    await prisma.session.create({
      data: {
        userId: user.id,
        refreshToken,
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip,
        expiresAt: refreshTokenExpiry(),
      },
    });

    const accessToken = signAccessToken({ sub: user.id, role: user.role });
    setRefreshCookie(res, refreshToken);

    await prisma.user.update({
      where: { id: user.id },
      data: { lastSeenAt: new Date() },
    });

    res.json({
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        accountKind: user.accountKind,
        profile: user.profile,
      },
    });
  } catch (e) {
    next(e);
  }
});

// POST /api/auth/refresh
router.post('/refresh', async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) return res.status(401).json({ error: 'Missing refresh token' });

    const session = await prisma.session.findUnique({
      where: { refreshToken: token },
      include: { user: true },
    });
    if (!session || session.revokedAt || session.expiresAt < new Date()) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    const accessToken = signAccessToken({ sub: session.user.id, role: session.user.role });
    res.json({ accessToken });
  } catch (e) {
    next(e);
  }
});

// POST /api/auth/logout
router.post('/logout', async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;
    if (token) {
      await prisma.session.updateMany({
        where: { refreshToken: token, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    }
    res.clearCookie('refreshToken', { path: '/api/auth' });
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

export default router;
