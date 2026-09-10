import { prisma } from './prisma.js';
import type { Offer, Request } from '@prisma/client';

const MIN_MATCH_SCORE = 35;
const MAX_MATCHES_PER_ITEM = 5;

// ---------- scoring primitives ----------

function timeToMinutes(t?: string | null): number | null {
  if (!t) return null;
  const [h, m] = t.split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return h * 60 + m;
}

function timeOverlapRatio(aFrom?: string | null, aTo?: string | null, bFrom?: string | null, bTo?: string | null): number {
  const aF = timeToMinutes(aFrom), aT = timeToMinutes(aTo);
  const bF = timeToMinutes(bFrom), bT = timeToMinutes(bTo);
  if (aF == null || aT == null || bF == null || bT == null) return 0.5; // no data → neutral
  const overlap = Math.max(0, Math.min(aT, bT) - Math.max(aF, bF));
  const span = Math.max(aT, bT) - Math.min(aF, bF);
  return span <= 0 ? 0 : overlap / span;
}

function dayOverlapRatio(a: string[], b: string[]): number {
  if (a.length === 0 || b.length === 0) return 0.5;
  const setB = new Set(b);
  return a.filter(d => setB.has(d)).length / Math.max(a.length, b.length);
}

function frequencyScore(offerFreq: string, requestFreq: string): number {
  if (offerFreq === requestFreq) return 1;
  if (offerFreq === 'FLEXIBLE' || requestFreq === 'FLEXIBLE') return 0.7;
  return 0.3;
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * 0-100 compatibility score between an offer and a request.
 * Returns null if a hard constraint fails (wrong category, out of range).
 */
export function scoreOfferRequestPair(
  offer: Offer,
  request: Request,
  offererRating: number,
  offererRatingCount: number
): number | null {
  if (offer.categoryId !== request.categoryId) return null;

  let proximity: number;
  if (offer.latitude != null && offer.longitude != null && request.latitude != null && request.longitude != null) {
    const dist = haversineKm(offer.latitude, offer.longitude, request.latitude, request.longitude);
    const radius = offer.radiusKm || 3;
    if (dist > radius) return null;
    proximity = 30 * Math.max(0, 1 - dist / radius);
  } else if (offer.zone && request.zone && offer.zone.trim().toLowerCase() === request.zone.trim().toLowerCase()) {
    proximity = 30 * 0.8;
  } else if (offer.city.trim().toLowerCase() === request.city.trim().toLowerCase()) {
    proximity = 30 * 0.5;
  } else {
    return null;
  }

  const dayScore = 25 * dayOverlapRatio(offer.availableDays, request.preferredDays);
  const timeScore = 20 * timeOverlapRatio(offer.timeFrom, offer.timeTo, request.timeFrom, request.timeTo);
  const freqScore = 10 * frequencyScore(offer.frequency, request.frequency);
  const repScore = offererRatingCount > 0 ? 15 * (offererRating / 5) : 15 * 0.5;

  return Math.round(proximity + dayScore + timeScore + freqScore + repScore);
}

// ---------- match creation ----------

async function createMatchSafely(offer: Offer, request: Request, score: number) {
  try {
    return await prisma.match.create({
      data: {
        offerId: offer.id,
        requestId: request.id,
        offererId: offer.offererId,
        requesterId: request.requesterId,
        score,
        status: 'SUGGESTED',
      },
    });
  } catch (e: any) {
    if (e.code === 'P2002') return null; // duplicate — another request beat us to it, fine
    throw e;
  }
}

/** Called right after an Offer is approved: find compatible requests. */
export async function findMatchesForOffer(offerId: string) {
  const offer = await prisma.offer.findUnique({
    where: { id: offerId },
    include: { offerer: { include: { profile: true } } },
  });
  if (!offer || offer.status !== 'APPROVED') return [];

  const candidates = await prisma.request.findMany({
    where: {
      categoryId: offer.categoryId,
      status: { in: ['APPROVED', 'WAITING_MATCH'] },
      requesterId: { not: offer.offererId },
    },
  });

  const existing = new Set(
    (await prisma.match.findMany({ where: { offerId }, select: { requestId: true } })).map(m => m.requestId)
  );

  const scored = candidates
    .filter(r => !existing.has(r.id))
    .map(request => ({
      request,
      score: scoreOfferRequestPair(
        offer, request,
        offer.offerer.profile?.ratingAverage ?? 0,
        offer.offerer.profile?.ratingCount ?? 0
      ),
    }))
    .filter((c): c is { request: Request; score: number } => c.score !== null && c.score >= MIN_MATCH_SCORE)
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_MATCHES_PER_ITEM);

  const created = [];
  for (const c of scored) {
    const m = await createMatchSafely(offer, c.request, c.score);
    if (m) created.push(m);
  }
  return created;
}

/** Called right after a Request is approved: find compatible offers. */
export async function findMatchesForRequest(requestId: string) {
  const request = await prisma.request.findUnique({ where: { id: requestId } });
  if (!request || !['APPROVED', 'WAITING_MATCH'].includes(request.status)) return [];

  const candidates = await prisma.offer.findMany({
    where: {
      categoryId: request.categoryId,
      status: 'APPROVED',
      offererId: { not: request.requesterId },
    },
    include: { offerer: { include: { profile: true } } },
  });

  const existing = new Set(
    (await prisma.match.findMany({ where: { requestId }, select: { offerId: true } })).map(m => m.offerId)
  );

  const scored = candidates
    .filter(o => !existing.has(o.id))
    .map(offer => ({
      offer,
      score: scoreOfferRequestPair(
        offer, request,
        offer.offerer.profile?.ratingAverage ?? 0,
        offer.offerer.profile?.ratingCount ?? 0
      ),
    }))
    .filter((c): c is { offer: typeof candidates[number]; score: number } => c.score !== null && c.score >= MIN_MATCH_SCORE)
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_MATCHES_PER_ITEM);

  const created = [];
  for (const c of scored) {
    const m = await createMatchSafely(c.offer, request, c.score);
    if (m) created.push(m);
  }
  return created;
}

/** Full sweep — safety net for anything the trigger-based flow missed. */
export async function runFullMatchSweep() {
  const approvedOffers = await prisma.offer.findMany({ where: { status: 'APPROVED' }, select: { id: true } });
  let matchesCreated = 0;
  for (const o of approvedOffers) {
    matchesCreated += (await findMatchesForOffer(o.id)).length;
  }
  return { offersScanned: approvedOffers.length, matchesCreated };
}

/** Cancel SUGGESTED matches tied to an item that's no longer active (withdrawn/rejected). */
export async function cancelSuggestedMatchesForOffer(offerId: string, reason: string) {
  await prisma.match.updateMany({
    where: { offerId, status: 'SUGGESTED' },
    data: { status: 'CANCELLED', cancelledAt: new Date(), cancellationReason: reason },
  });
}