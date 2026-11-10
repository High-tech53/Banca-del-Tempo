import type { ReactNode } from 'react';
import { TableShell } from '../pages/admin/ui';

const range = (n: number) => Array.from({ length: n }, (_, i) => i);
const card = 'bg-white rounded-2xl border border-ink-200';

/** The basic grey pulsing block. Everything below is built from this. */
export function Skeleton({ className = '' }: { className?: string }) {
  return <div aria-hidden="true" className={`animate-pulse bg-ink-100 rounded-md ${className}`} />;
}

/** Wrapper so screen readers announce "loading" once, instead of reading empty blocks. */
function Region({ className = '', children }: { className?: string; children: ReactNode }) {
  return (
    <div role="status" aria-busy="true" className={className}>
      <span className="sr-only">Caricamento…</span>
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Public pages                                                        */
/* ------------------------------------------------------------------ */

export function OfferCardSkeleton() {
  return (
    <div className={`${card} overflow-hidden`}>
      <Skeleton className="h-32 rounded-none" />
      <div className="p-5">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-3 w-full mt-3" />
        <Skeleton className="h-3 w-5/6 mt-2" />
        <div className="flex items-center gap-3 mt-5 pt-4 border-t border-ink-100">
          <Skeleton className="w-8 h-8 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-3 w-1/3 mt-2" />
          </div>
        </div>
      </div>
    </div>
  );
}

/** Grid of offer cards (Esplora page). */
export function OfferGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <Region className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
      {range(count).map(i => <OfferCardSkeleton key={i} />)}
    </Region>
  );
}

/** Full offer detail page (OfferDetail). Mirrors the real layout so nothing jumps. */
export function OfferDetailSkeleton() {
  return (
    <Region className="max-w-7xl mx-auto px-6 py-10">
      <Skeleton className="h-4 w-40 mb-6" />
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-3xl border border-ink-200 overflow-hidden">
          <Skeleton className="h-48 rounded-none" />
          <div className="p-8">
            <Skeleton className="h-9 w-3/4" />
            <div className="flex flex-wrap gap-6 mt-5">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-5 w-28 mt-8" />
            <Skeleton className="h-3 w-full mt-4" />
            <Skeleton className="h-3 w-full mt-2" />
            <Skeleton className="h-3 w-2/3 mt-2" />
            <Skeleton className="h-5 w-32 mt-8" />
            <div className="grid grid-cols-7 gap-2 mt-4">
              {range(7).map(i => <Skeleton key={i} className="h-14 rounded-xl" />)}
            </div>
          </div>
        </div>

        <aside>
          <div className="bg-white rounded-3xl border border-ink-200 p-6">
            <div className="flex items-center gap-4">
              <Skeleton className="w-16 h-16 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-3 w-1/3 mt-2" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-5">
              {range(3).map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}
            </div>
            <Skeleton className="h-14 rounded-xl mt-6" />
          </div>
        </aside>
      </div>
    </Region>
  );
}

/** Cards for "Le mie offerte" / "Le mie richieste". */
export function ItemGridSkeleton({ count = 3 }: { count?: number }) {
  return (
    <Region className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {range(count).map(i => (
        <div key={i} className={`${card} overflow-hidden`}>
          <Skeleton className="h-24 rounded-none" />
          <div className="p-5">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-3 w-full mt-3" />
            <Skeleton className="h-3 w-2/3 mt-2" />
            <Skeleton className="h-3 w-1/2 mt-4" />
          </div>
        </div>
      ))}
    </Region>
  );
}

/** "Le tue offerte recenti" block on the user dashboard. */
export function DashboardOffersSkeleton() {
  return (
    <Region className="grid md:grid-cols-2 gap-4">
      {range(2).map(i => (
        <div key={i} className={`${card} p-5 flex items-start gap-4`}>
          <Skeleton className="w-12 h-12 rounded-xl flex-shrink-0" />
          <div className="flex-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2 mt-2" />
            <Skeleton className="h-5 w-20 mt-3 rounded-full" />
          </div>
        </div>
      ))}
    </Region>
  );
}

export function ProfileSkeleton() {
  return (
    <Region className="max-w-5xl mx-auto px-6 py-8">
      <div className="bg-white rounded-3xl border border-ink-200 overflow-hidden">
        <Skeleton className="h-40 rounded-none" />
        <div className="px-8 pb-8">
          <div className="flex items-end gap-4 -mt-12 mb-4 flex-wrap">
            <Skeleton className="w-28 h-28 rounded-3xl border-4 border-white" />
            <div className="pb-1">
              <Skeleton className="h-8 w-56" />
              <Skeleton className="h-4 w-64 mt-3" />
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
            {range(4).map(i => <Skeleton key={i} className="h-20 rounded-2xl" />)}
          </div>
          <Skeleton className="h-5 w-24 mt-8" />
          <Skeleton className="h-3 w-full mt-4" />
          <Skeleton className="h-3 w-5/6 mt-2" />
        </div>
      </div>
    </Region>
  );
}

/* ------------------------------------------------------------------ */
/* Admin panel                                                         */
/* ------------------------------------------------------------------ */

/** Any admin table. Pass the same headers the real table uses. */
export function TableSkeleton({ headers, rows = 6 }: { headers: string[]; rows?: number }) {
  return (
    <div role="status" aria-busy="true">
      <span className="sr-only">Caricamento…</span>
      <TableShell headers={headers}>
        {range(rows).map(r => (
          <tr key={r} className="border-t border-ink-100">
            {headers.map((_, c) => (
              <td key={c} className="px-4 py-4">
                <Skeleton className={`h-4 ${c === 0 ? 'w-48' : 'w-20'}`} />
              </td>
            ))}
          </tr>
        ))}
      </TableShell>
    </div>
  );
}

export function AdminDashboardSkeleton() {
  return (
    <Region>
      <div className="mb-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64 mt-3" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {range(4).map(i => (
          <div key={i} className={`${card} p-6`}>
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-10 w-16 mt-4" />
          </div>
        ))}
      </div>
      <div className="grid lg:grid-cols-3 gap-4">
        <div className={`lg:col-span-2 ${card} p-6`}>
          <Skeleton className="h-5 w-56" />
          <Skeleton className="h-48 w-full mt-6" />
        </div>
        <div className={`${card} p-6`}>
          <Skeleton className="h-5 w-24" />
          {range(3).map(i => <Skeleton key={i} className="h-16 w-full mt-3 rounded-lg" />)}
        </div>
      </div>
    </Region>
  );
}

export function AdminAnalyticsSkeleton() {
  return (
    <Region>
      <div className="mb-6">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-72 mt-3" />
      </div>
      <div className="grid lg:grid-cols-2 gap-4">
        <div className={`${card} p-6`}>
          <Skeleton className="h-5 w-64" />
          <Skeleton className="h-3 w-48 mt-2" />
          {range(6).map(i => <Skeleton key={i} className="h-4 w-full mt-5" />)}
        </div>
        <div className={`${card} p-6`}>
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-3 w-40 mt-2" />
          {range(4).map(i => <Skeleton key={i} className="h-12 w-full mt-3 rounded-xl" />)}
        </div>
        <div className={`lg:col-span-2 ${card} p-6`}>
          <Skeleton className="h-5 w-64" />
          <Skeleton className="h-32 w-full mt-6" />
        </div>
      </div>
    </Region>
  );
}

export function CategoryGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <Region className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {range(count).map(i => (
        <div key={i} className={`${card} p-5`}>
          <div className="flex items-start justify-between">
            <Skeleton className="w-12 h-12 rounded-xl" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
          <Skeleton className="h-5 w-2/3 mt-4" />
          <Skeleton className="h-3 w-1/2 mt-3" />
        </div>
      ))}
    </Region>
  );
}

export function MatchGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <Region className="grid md:grid-cols-2 gap-4">
      {range(count).map(i => (
        <div key={i} className={`${card} p-5`}>
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="w-8 h-8 rounded-lg" />
            <Skeleton className="h-6 w-28 rounded-full" />
          </div>
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
            <div>
              <Skeleton className="h-8 w-28" />
              <Skeleton className="h-3 w-32 mt-3" />
            </div>
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="flex flex-col items-end">
              <Skeleton className="h-8 w-28" />
              <Skeleton className="h-3 w-32 mt-3" />
            </div>
          </div>
        </div>
      ))}
    </Region>
  );
}

/** Two-pane moderation queue. */
export function ModerationSkeleton() {
  return (
    <Region className="grid lg:grid-cols-5 gap-4">
      <div className="lg:col-span-2">
        {range(3).map(i => (
          <div key={i} className={`${card} p-4 ${i > 0 ? 'mt-3' : ''}`}>
            <div className="flex items-center justify-between mb-3">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/3 mt-3" />
          </div>
        ))}
      </div>
      <div className={`lg:col-span-3 ${card} p-6`}>
        <Skeleton className="h-7 w-2/3" />
        <Skeleton className="h-3 w-1/2 mt-3" />
        <Skeleton className="h-32 w-full mt-5 rounded-xl" />
        <Skeleton className="h-16 w-full mt-5 rounded-xl" />
        <div className="flex gap-2 mt-5">
          <Skeleton className="h-11 flex-1 rounded-xl" />
          <Skeleton className="h-11 flex-1 rounded-xl" />
        </div>
      </div>
    </Region>
  );
}
