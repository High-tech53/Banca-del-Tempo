import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: { profile: true },
    });
    if (!user) return res.status(404).json({ error: 'Utente non trovato' });
    res.json({
      id: user.id,
      email: user.email,
      role: user.role,
      accountKind: user.accountKind,
      profile: user.profile,
    });
  } catch (e) {
    next(e);
  }
});

export default router;
