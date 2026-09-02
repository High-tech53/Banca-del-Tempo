import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.js';
import { Frequency, RequestStatus, Urgency } from '@prisma/client';

const router = Router();

const createSchema = z.object({
  categoryId: z.string().uuid(),
  title: z.string().min(3).max(120),
  description: z.string().min(10).max(2000),
  motivation: z.string().max(1000).optional(),
  urgency: z.nativeEnum(Urgency).default(Urgency.NORMAL),
  frequency: z.nativeEnum(Frequency),
  preferredDays: z.array(z.enum(['MON','TUE','WED','THU','FRI','SAT','SUN'])).default([]),
  timeFrom: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  timeTo: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  zone: z.string().min(1),
  city: z.string().min(1),
  zipCode: z.string().min(3),
});

router.get('/', async (req, res, next) => {
  try {
    const { category, city, urgency, q } = req.query as Record<string, string>;
    const where: any = { status: { in: [RequestStatus.APPROVED, RequestStatus.WAITING_MATCH] } };
    if (category) where.category = { slug: category };
    if (city) where.city = { equals: city, mode: 'insensitive' };
    if (urgency) where.urgency = urgency;
    if (q) where.OR = [
      { title: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } },
    ];

    const items = await prisma.request.findMany({
      where,
      take: 20,
      orderBy: [{ urgency: 'desc' }, { createdAt: 'desc' }],
      include: {
        category: true,
        requester: {
          select: {
            id: true,
            profile: {
              select: { firstName: true, lastName: true, showLastName: true, photoUrl: true, ratingAverage: true, ratingCount: true },
            },
          },
        },
      },
    });
    res.json({ data: items });
  } catch (e) { next(e); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const item = await prisma.request.findUnique({
      where: { id: req.params.id },
      include: {
        category: true,
        requester: { select: { id: true, profile: true } },
      },
    });
    if (!item) return res.status(404).json({ error: 'Richiesta non trovata' });
    res.json(item);
  } catch (e) { next(e); }
});

router.post('/', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const input = createSchema.parse(req.body);
    const item = await prisma.request.create({
      data: { ...input, requesterId: req.user!.id, status: RequestStatus.PENDING_REVIEW },
      include: { category: true },
    });
    res.status(201).json(item);
  } catch (e) { next(e); }
});

router.get('/mine/list', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const items = await prisma.request.findMany({
      where: { requesterId: req.user!.id },
      orderBy: { createdAt: 'desc' },
      include: { category: true },
    });
    res.json(items);
  } catch (e) { next(e); }
});

export default router;
