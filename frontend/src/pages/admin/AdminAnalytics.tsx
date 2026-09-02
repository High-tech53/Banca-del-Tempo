import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { PageHeader, statusLabel } from './ui';

interface Analytics {
  byCategory: { name: string; icon: string; _count: { offers: number; requests: number } }[];
  statusBreakdown: { status: string; _count: { _all: number } }[];
  userGrowth: { week: string; count: number }[];
}

export default function AdminAnalytics() {
  const { data, isLoading } = useQuery<Analytics>({
    queryKey: ['admin-analytics'],
    queryFn: async () => (await api.get('/admin/analytics')).data,
  });

  if (isLoading) return <div className="text-ink-500">Caricamento…</div>;

  const cats = data?.byCategory ?? [];
  const maxCat = Math.max(1, ...cats.map(c => c._count.offers + c._count.requests));
  const growth = data?.userGrowth ?? [];
  const maxGrowth = Math.max(1, ...growth.map(g => g.count));

  return (
    <>
      <PageHeader title="Analytics" subtitle="Panoramica delle metriche della piattaforma" />

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Supply vs demand per category */}
        <div className="bg-white rounded-2xl p-6 border border-ink-200">
          <h3 className="font-semibold mb-1">Domanda e offerta per categoria</h3>
          <p className="text-xs text-ink-500 mb-5">Offerte (terracotta) vs richieste (verde)</p>
          <div className="space-y-3">
            {cats.map(c => {
              const total = c._count.offers + c._count.requests;
              const gap = c._count.offers - c._count.requests;
              return (
                <div key={c.name} className="flex items-center gap-3">
                  <div className="w-36 text-sm truncate">{c.icon} {c.name}</div>
                  <div className="flex-1 flex items-center gap-0.5 h-4">
                    {c._count.offers > 0 && (
                      <div className="h-full bg-primary-500 rounded-sm" style={{ width: `${(c._count.offers / maxCat) * 100}%` }} />
                    )}
                    {c._count.requests > 0 && (
                      <div className="h-full bg-sage-500 rounded-sm" style={{ width: `${(c._count.requests / maxCat) * 100}%` }} />
                    )}
                    {total === 0 && <div className="h-full w-1 bg-ink-200 rounded-sm" />}
                  </div>
                  <div className={`w-24 text-right text-xs font-semibold ${gap >= 0 ? 'text-sage-700' : 'text-red-700'}`}>
                    {gap >= 0 ? `+${gap} surplus` : `${gap} gap ⚠`}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Offer status breakdown */}
        <div className="bg-white rounded-2xl p-6 border border-ink-200">
          <h3 className="font-semibold mb-1">Stato delle offerte</h3>
          <p className="text-xs text-ink-500 mb-5">Distribuzione per stato</p>
          <div className="space-y-3">
            {(data?.statusBreakdown ?? []).map(s => (
              <div key={s.status} className="flex items-center justify-between p-3 bg-ink-50 rounded-xl">
                <span className="text-sm font-medium">{statusLabel(s.status)}</span>
                <span className="font-display text-xl font-semibold">{s._count._all}</span>
              </div>
            ))}
            {(data?.statusBreakdown ?? []).length === 0 && (
              <p className="text-sm text-ink-400">Nessuna offerta ancora.</p>
            )}
          </div>
        </div>

        {/* User growth */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-ink-200">
          <h3 className="font-semibold mb-1">Crescita utenti — ultime 13 settimane</h3>
          <p className="text-xs text-ink-500 mb-5">Nuove registrazioni per settimana</p>
          {growth.length === 0 ? (
            <div className="h-32 grid place-items-center text-sm text-ink-400">Nessun dato ancora</div>
          ) : (
            <div className="h-32 flex items-end gap-2">
              {growth.map(g => (
                <div key={String(g.week)} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-sage-500 rounded-t-md min-h-[4px]"
                    style={{ height: `${(g.count / maxGrowth) * 100}%` }}
                    title={`${g.week}: ${g.count} utenti`}
                  />
                  <span className="text-[10px] text-ink-400">
                    {new Date(g.week).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
