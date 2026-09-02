import { useQuery } from '@tanstack/react-query';
import { ArrowLeftRight } from 'lucide-react';
import { api } from '../../lib/api';
import { PageHeader, Badge, statusTone, statusLabel, Avatar } from './ui';

interface AdminMatch {
  id: string; score: number; status: string; createdAt: string;
  offer: { title: string; category: { icon: string; name: string } };
  request: { title: string };
  offerer: { profile: { firstName: string; lastName: string } | null };
  requester: { profile: { firstName: string; lastName: string } | null };
}

export default function AdminMatch() {
  const { data: matches = [], isLoading } = useQuery<AdminMatch[]>({
    queryKey: ['admin-matches'],
    queryFn: async () => (await api.get('/admin/matches')).data,
  });

  return (
    <>
      <PageHeader title="Match Engine" subtitle={`${matches.length} match nel sistema`} />

      {isLoading && <div className="text-ink-500">Caricamento…</div>}

      {!isLoading && matches.length === 0 && (
        <div className="bg-white rounded-2xl border border-ink-200 p-12 text-center">
          <p className="text-ink-500">Nessun match ancora. I match si creano quando un utente risponde a un'offerta o richiesta.</p>
          <p className="text-xs text-ink-400 mt-2">Il motore di matching automatico è nella roadmap — vedi README.</p>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {matches.map(m => (
          <div key={m.id} className="bg-white rounded-2xl border border-ink-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-2xl">{m.offer.category.icon}</span>
              <div className="flex items-center gap-2">
                <Badge tone={m.score >= 80 ? 'green' : 'amber'}>Match {m.score}%</Badge>
                <Badge tone={statusTone(m.status)}>{statusLabel(m.status)}</Badge>
              </div>
            </div>
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
              <div className="min-w-0">
                <div className="text-[10px] font-semibold text-ink-400 uppercase tracking-wider mb-1">Richiede</div>
                <div className="flex items-center gap-2">
                  <Avatar name={m.requester.profile?.firstName} />
                  <span className="text-sm font-medium truncate">{m.requester.profile?.firstName}</span>
                </div>
                <div className="text-xs text-ink-500 mt-1.5 truncate">{m.request.title}</div>
              </div>
              <div className="w-10 h-10 rounded-full bg-ink-900 grid place-items-center flex-shrink-0">
                <ArrowLeftRight className="w-4 h-4 text-white" />
              </div>
              <div className="min-w-0 text-right">
                <div className="text-[10px] font-semibold text-ink-400 uppercase tracking-wider mb-1">Offre</div>
                <div className="flex items-center gap-2 justify-end">
                  <span className="text-sm font-medium truncate">{m.offerer.profile?.firstName}</span>
                  <Avatar name={m.offerer.profile?.firstName} />
                </div>
                <div className="text-xs text-ink-500 mt-1.5 truncate">{m.offer.title}</div>
              </div>
            </div>
            <div className="text-xs text-ink-400 mt-4 pt-4 border-t border-ink-100">
              Creato il {new Date(m.createdAt).toLocaleDateString('it-IT')}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
