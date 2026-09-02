import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.js';
import { Frequency, OfferStatus } from '@prisma/client';

const router = Router();

const createSchema = z.object({
  categoryId: z.string().uuid(),
  title: z.string().min(3).max(120),
  description: z.string().min(10).max(2000),
  frequency: z.nativeEnum(Frequency),
  availableDays: z.array(z.enum(['MON','TUE','WED','THU','FRI','SAT','SUN'])).default([]),
  timeFrom: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  timeTo: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  zone: z.string().min(1),
  city: z.string().min(1),
  zipCode: z.string().min(3),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  radiusKm: z.number().min(0.5).max(50).default(3),
});

const querySchema = z.object({
  category: z.string().optional(),
  city: z.string().optional(),
  q: z.string().optional(),
  status: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  cursor: z.string().optional(),
});

// GET /api/offers — public, list approved
router.get('/', async (req, res, next) => {
  try {
    const q = querySchema.parse(req.query);

    const where: any = { status: OfferStatus.APPROVED };
    if (q.category) where.category = { slug: q.category };
    if (q.city) where.city = { equals: q.city, mode: 'insensitive' };
    if (q.q) {
      where.OR = [
        { title: { contains: q.q, mode: 'insensitive' } },
        { description: { contains: q.q, mode: 'insensitive' } },
      ];
    }

    const items = await prisma.offer.findMany({
      where,
      take: q.limit + 1,
      ...(q.cursor && { cursor: { id: q.cursor }, skip: 1 }),
      orderBy: { createdAt: 'desc' },
      include: {
        category: true,
        offerer: {
          select: {
            id: true,
            profile: {
              select: { firstName: true, lastName: true, showLastName: true, photoUrl: true, ratingAverage: true, ratingCount: true, verificationStatus: true },
            },
          },
        },
      },
    });

    const hasMore = items.length > q.limit;
    const data = hasMore ? items.slice(0, q.limit) : items;
    res.json({
      data,
      nextCursor: hasMore ? data[data.length - 1].id : null,
    });
  } catch (e) { next(e); }
});

// GET /api/offers/:id
router.get('/:id', async (req, res, next) => {
  try {
    const offer = await prisma.offer.findUnique({
      where: { id: req.params.id },
      include: {
        category: true,
        offerer: {
          select: {
            id: true,
            profile: true,
          },
        },
      },
    });
    if (!offer) return res.status(404).json({ error: 'Offerta non trovata' });

    // Increment view count (non-blocking)
    prisma.offer.update({ where: { id: offer.id }, data: { viewCount: { increment: 1 } } }).catch(() => {});

    res.json(offer);
  } catch (e) { next(e); }
});

// POST /api/offers — auth
router.post('/', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const input = createSchema.parse(req.body);
    const offer = await prisma.offer.create({
      data: {
        ...input,
        offererId: req.user!.id,
        status: OfferStatus.PENDING_REVIEW,
      },
      include: { category: true },
    });
    res.status(201).json(offer);
  } catch (e) { next(e); }
});

// GET /api/offers/mine/list — auth
router.get('/mine/list', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const offers = await prisma.offer.findMany({
      where: { offererId: req.user!.id },
      orderBy: { createdAt: 'desc' },
      include: { category: true },
    });
    res.json(offers);
  } catch (e) { next(e); }
});

// DELETE /api/offers/:id — auth, only owner
router.delete('/:id', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const offer = await prisma.offer.findUnique({ where: { id: req.params.id } });
    if (!offer) return res.status(404).json({ error: 'Offerta non trovata' });
    if (offer.offererId !== req.user!.id) return res.status(403).json({ error: 'Non sei il proprietario' });
    await prisma.offer.update({
      where: { id: offer.id },
      data: { status: OfferStatus.WITHDRAWN },
    });
    res.json({ ok: true });
  } catch (e) { next(e); }
});

export default router;
