import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { requireAuth, requireRole, AuthenticatedRequest } from '../middleware/auth.js';
import { OfferStatus, RequestStatus, FlagStatus, MatchStatus } from '@prisma/client';

const router = Router();

// All admin routes require moderator or admin role
router.use(requireAuth, requireRole('MODERATOR', 'ADMIN'));

// Helper: write an audit log entry
async function audit(actorId: string, action: string, entityType?: string, entityId?: string, metadata?: object) {
  await prisma.auditLog.create({
    data: { actorId, action, entityType, entityId, metadata: metadata as any },
  }).catch(() => {});
}

// ============================================================
// GET /api/admin/stats — dashboard KPIs
// ============================================================
router.get('/stats', async (_req, res, next) => {
  try {
    const startOfDay = new Date(); startOfDay.setHours(0, 0, 0, 0);
    const [pendingOffers, pendingRequests, activeMatches, approvedToday, openFlags, totalUsers, submissionsByDay] =
      await Promise.all([
        prisma.offer.count({ where: { status: OfferStatus.PENDING_REVIEW } }),
        prisma.request.count({ where: { status: RequestStatus.PENDING_REVIEW } }),
        prisma.match.count({ where: { status: { in: [MatchStatus.ACCEPTED, MatchStatus.IN_PROGRESS] } } }),
        prisma.offer.count({ where: { approvedAt: { gte: startOfDay } } }),
        prisma.flag.count({ where: { status: FlagStatus.OPEN } }),
        prisma.user.count(),
        prisma.$queryRaw`
          SELECT date_trunc('day', "createdAt")::date AS day,
                 COUNT(*)::int AS count
          FROM "Offer"
          WHERE "createdAt" > now() - interval '30 days'
          GROUP BY 1 ORDER BY 1
        `,
      ]);
    res.json({
      pendingReview: pendingOffers + pendingRequests,
      pendingOffers, pendingRequests,
      activeMatches, approvedToday, openFlags, totalUsers,
      submissionsByDay,
    });
  } catch (e) { next(e); }
});

// ============================================================
// OFFERS management
// ============================================================
router.get('/offers', async (req, res, next) => {
  try {
    const status = req.query.status as string | undefined;
    const offers = await prisma.offer.findMany({
      where: status ? { status: status as OfferStatus } : undefined,
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        category: true,
        offerer: { select: { id: true, email: true, profile: { select: { firstName: true, lastName: true } } } },
      },
    });
    res.json(offers);
  } catch (e) { next(e); }
});

const decisionSchema = z.object({
  action: z.enum(['approve', 'reject']),
  note: z.string().max(1000).optional(),
});

router.patch('/offers/:id', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { action, note } = decisionSchema.parse(req.body);
    const offer = await prisma.offer.update({
      where: { id: req.params.id },
      data: {
        status: action === 'approve' ? OfferStatus.APPROVED : OfferStatus.REJECTED,
        approvedAt: action === 'approve' ? new Date() : null,
        internalNotes: note,
      },
    });
    await audit(req.user!.id, action === 'approve' ? 'OFFER_APPROVED' : 'OFFER_REJECTED', 'Offer', offer.id, { note });
    res.json(offer);
  } catch (e) { next(e); }
});

// ============================================================
// REQUESTS management
// ============================================================
router.get('/requests', async (req, res, next) => {
  try {
    const status = req.query.status as string | undefined;
    const items = await prisma.request.findMany({
      where: status ? { status: status as RequestStatus } : undefined,
      orderBy: [{ urgency: 'desc' }, { createdAt: 'desc' }],
      take: 100,
      include: {
        category: true,
        requester: { select: { id: true, email: true, profile: { select: { firstName: true, lastName: true } } } },
      },
    });
    res.json(items);
  } catch (e) { next(e); }
});

router.patch('/requests/:id', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { action, note } = decisionSchema.parse(req.body);
    const item = await prisma.request.update({
      where: { id: req.params.id },
      data: {
        status: action === 'approve' ? RequestStatus.WAITING_MATCH : RequestStatus.REJECTED,
        approvedAt: action === 'approve' ? new Date() : null,
        internalNotes: note,
      },
    });
    await audit(req.user!.id, action === 'approve' ? 'REQUEST_APPROVED' : 'REQUEST_REJECTED', 'Request', item.id, { note });
    res.json(item);
  } catch (e) { next(e); }
});

// ============================================================
// MATCHES
// ============================================================
router.get('/matches', async (_req, res, next) => {
  try {
    const matches = await prisma.match.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        offer: { select: { title: true, category: { select: { icon: true, name: true } } } },
        request: { select: { title: true } },
        offerer: { select: { profile: { select: { firstName: true, lastName: true } } } },
        requester: { select: { profile: { select: { firstName: true, lastName: true } } } },
      },
    });
    res.json(matches);
  } catch (e) { next(e); }
});

// ============================================================
// USERS
// ============================================================
router.get('/users', async (req, res, next) => {
  try {
    const q = (req.query.q as string | undefined)?.trim();
    const users = await prisma.user.findMany({
      where: q ? {
        OR: [
          { email: { contains: q, mode: 'insensitive' } },
          { profile: { firstName: { contains: q, mode: 'insensitive' } } },
          { profile: { lastName: { contains: q, mode: 'insensitive' } } },
        ],
      } : undefined,
      orderBy: { createdAt: 'desc' },
      take: 100,
      select: {
        id: true, email: true, role: true, accountKind: true, suspended: true, createdAt: true,
        profile: { select: { firstName: true, lastName: true, city: true, verificationStatus: true, helpsCompleted: true, ratingAverage: true } },
        _count: { select: { flagsAgainst: true } },
      },
    });
    res.json(users);
  } catch (e) { next(e); }
});

router.patch('/users/:id', async (req: AuthenticatedRequest, res, next) => {
  try {
    const body = z.object({ suspended: z.boolean() }).parse(req.body);
    // Prevent self-suspension
    if (req.params.id === req.user!.id) return res.status(400).json({ error: 'Non puoi sospendere te stesso' });
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { suspended: body.suspended },
      select: { id: true, email: true, suspended: true },
    });
    await audit(req.user!.id, body.suspended ? 'USER_SUSPENDED' : 'USER_RESTORED', 'User', user.id);
    res.json(user);
  } catch (e) { next(e); }
});

// ============================================================
// FLAGS (segnalazioni)
// ============================================================
router.get('/flags', async (_req, res, next) => {
  try {
    const flags = await prisma.flag.findMany({
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
      take: 100,
      include: {
        reporter: { select: { profile: { select: { firstName: true, lastName: true } } } },
        reportedUser: { select: { profile: { select: { firstName: true, lastName: true } } } },
      },
    });
    res.json(flags);
  } catch (e) { next(e); }
});

router.patch('/flags/:id', async (req: AuthenticatedRequest, res, next) => {
  try {
    const body = z.object({
      status: z.nativeEnum(FlagStatus),
      resolution: z.string().max(1000).optional(),
    }).parse(req.body);
    const flag = await prisma.flag.update({
      where: { id: req.params.id },
      data: {
        status: body.status,
        resolution: body.resolution,
        resolvedAt: body.status === FlagStatus.RESOLVED || body.status === FlagStatus.DISMISSED ? new Date() : null,
        resolvedById: req.user!.id,
      },
    });
    await audit(req.user!.id, `FLAG_${body.status}`, 'Flag', flag.id);
    res.json(flag);
  } catch (e) { next(e); }
});

// ============================================================
// CATEGORIES (CRUD)
// ============================================================
router.get('/categories', async (_req, res, next) => {
  try {
    const cats = await prisma.category.findMany({
      orderBy: { sortOrder: 'asc' },
      include: { _count: { select: { offers: true, requests: true } } },
    });
    res.json(cats);
  } catch (e) { next(e); }
});

const categorySchema = z.object({
  name: z.string().min(2).max(60),
  slug: z.string().min(2).max(60).regex(/^[a-z0-9-]+$/),
  icon: z.string().min(1).max(8),
  active: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

router.post('/categories', async (req: AuthenticatedRequest, res, next) => {
  try {
    const input = categorySchema.parse(req.body);
    const cat = await prisma.category.create({ data: input });
    await audit(req.user!.id, 'CATEGORY_CREATED', 'Category', cat.id);
    res.status(201).json(cat);
  } catch (e) { next(e); }
});

router.patch('/categories/:id', async (req: AuthenticatedRequest, res, next) => {
  try {
    const input = categorySchema.partial().parse(req.body);
    const cat = await prisma.category.update({ where: { id: req.params.id }, data: input });
    await audit(req.user!.id, 'CATEGORY_UPDATED', 'Category', cat.id);
    res.json(cat);
  } catch (e) { next(e); }
});

// ============================================================
// ANALYTICS
// ============================================================
router.get('/analytics', async (_req, res, next) => {
  try {
    const [byCategory, statusBreakdown, userGrowth] = await Promise.all([
      prisma.category.findMany({
        orderBy: { sortOrder: 'asc' },
        select: {
          name: true, icon: true,
          _count: { select: { offers: true, requests: true } },
        },
      }),
      prisma.offer.groupBy({ by: ['status'], _count: { _all: true } }),
      prisma.$queryRaw`
        SELECT date_trunc('week', "createdAt")::date AS week, COUNT(*)::int AS count
        FROM "User"
        WHERE "createdAt" > now() - interval '90 days'
        GROUP BY 1 ORDER BY 1
      `,
    ]);
    res.json({ byCategory, statusBreakdown, userGrowth });
  } catch (e) { next(e); }
});

// ============================================================
// AUDIT LOG
// ============================================================
router.get('/audit-log', async (_req, res, next) => {
  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        actor: { select: { email: true, profile: { select: { firstName: true, lastName: true } } } },
      },
    });
    res.json(logs);
  } catch (e) { next(e); }
});

export default router;
