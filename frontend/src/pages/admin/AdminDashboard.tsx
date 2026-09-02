import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { PageHeader, KpiCard } from './ui';

interface Stats {
  pendingReview: number;
  pendingOffers: number;
  pendingRequests: number;
  activeMatches: number;
  approvedToday: number;
  openFlags: number;
  totalUsers: number;
  submissionsByDay: { day: string; count: number }[];
}

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery<Stats>({
    queryKey: ['admin-stats'],
    queryFn: async () => (await api.get('/admin/stats')).data,
  });

  if (isLoading) return <div className="text-ink-500">Caricamento…</div>;

  const days = stats?.submissionsByDay ?? [];
  const maxCount = Math.max(1, ...days.map(d => d.count));

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle={new Date().toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard label="In revisione" value={stats?.pendingReview ?? 0} />
        <KpiCard label="Match attivi" value={stats?.activeMatches ?? 0} />
        <KpiCard label="Approvati oggi" value={stats?.approvedToday ?? 0} />
        <KpiCard label="Segnalazioni aperte" value={stats?.openFlags ?? 0} accent={(stats?.openFlags ?? 0) > 0} />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Submissions chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-ink-200">
          <h3 className="font-semibold">Offerte create — ultimi 30 giorni</h3>
          <p className="text-xs text-ink-500 mt-0.5">{days.length} giorni con attività</p>
          {days.length === 0 ? (
            <div className="h-48 grid place-items-center text-sm text-ink-400">Nessun dato ancora</div>
          ) : (
            <div className="mt-6 h-48 flex items-end gap-1">
              {days.map(d => (
                <div key={String(d.day)} className="flex-1 flex flex-col items-center gap-1 group">
                  <div
                    className="w-full bg-primary-500 rounded-t-md group-hover:bg-primary-600 transition min-h-[4px]"
                    style={{ height: `${(d.count / maxCount) * 100}%` }}
                    title={`${d.day}: ${d.count}`}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="bg-white rounded-2xl p-6 border border-ink-200">
          <h3 className="font-semibold mb-4">Da fare</h3>
          <div className="space-y-3">
            <Link to="/admin/offerte" className="block p-3 bg-primary-50 rounded-lg hover:bg-primary-100 transition">
              <div className="text-sm font-semibold">{stats?.pendingOffers ?? 0} offerte da revisionare</div>
              <p className="text-xs text-ink-600 mt-0.5">Approva o rifiuta le nuove offerte</p>
            </Link>
            <Link to="/admin/richieste" className="block p-3 bg-white border border-ink-200 rounded-lg hover:bg-ink-50 transition">
              <div className="text-sm font-semibold">{stats?.pendingRequests ?? 0} richieste da revisionare</div>
              <p className="text-xs text-ink-600 mt-0.5">Verifica le richieste di aiuto</p>
            </Link>
            <Link to="/admin/segnalazioni" className="block p-3 bg-white border border-ink-200 rounded-lg hover:bg-ink-50 transition">
              <div className="text-sm font-semibold">{stats?.openFlags ?? 0} segnalazioni aperte</div>
              <p className="text-xs text-ink-600 mt-0.5">Gestisci i report degli utenti</p>
            </Link>
          </div>
          <div className="mt-5 pt-5 border-t border-ink-100 text-sm text-ink-500">
            {stats?.totalUsers ?? 0} utenti registrati in totale
          </div>
        </div>
      </div>
    </>
  );
}
