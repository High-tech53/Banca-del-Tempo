import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Check, X, Edit3 } from 'lucide-react';
import { api } from '../../lib/api';
import { PageHeader, Badge } from './ui';

interface PendingOffer {
  id: string; title: string; description: string; zone: string; createdAt: string; riskScore: number;
  category: { icon: string; name: string };
  offerer: { email: string; profile: { firstName: string; lastName: string } | null };
}
interface PendingRequest {
  id: string; title: string; description: string; urgency: string; createdAt: string; riskScore: number;
  category: { icon: string; name: string };
  requester: { email: string; profile: { firstName: string; lastName: string } | null };
}

type QueueItem =
  | ({ kind: 'offer' } & PendingOffer)
  | ({ kind: 'request' } & PendingRequest);

export default function AdminModerazione() {
  const qc = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [note, setNote] = useState('');

  const { data: offers = [] } = useQuery<PendingOffer[]>({
    queryKey: ['admin-offers', 'PENDING_REVIEW'],
    queryFn: async () => (await api.get('/admin/offers', { params: { status: 'PENDING_REVIEW' } })).data,
  });
  const { data: requests = [] } = useQuery<PendingRequest[]>({
    queryKey: ['admin-requests', 'PENDING_REVIEW'],
    queryFn: async () => (await api.get('/admin/requests', { params: { status: 'PENDING_REVIEW' } })).data,
  });

  const queue: QueueItem[] = [
    ...offers.map(o => ({ kind: 'offer' as const, ...o })),
    ...requests.map(r => ({ kind: 'request' as const, ...r })),
  ].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  const selected = queue.find(i => i.id === selectedId) ?? queue[0] ?? null;

  const decide = useMutation({
    mutationFn: async ({ item, action }: { item: QueueItem; action: 'approve' | 'reject' }) => {
      const url = item.kind === 'offer' ? `/admin/offers/${item.id}` : `/admin/requests/${item.id}`;
      return (await api.patch(url, { action, note: note || undefined })).data;
    },
    onSuccess: () => {
      setNote('');
      setSelectedId(null);
      qc.invalidateQueries({ queryKey: ['admin-offers'] });
      qc.invalidateQueries({ queryKey: ['admin-requests'] });
      qc.invalidateQueries({ queryKey: ['admin-stats'] });
      qc.invalidateQueries({ queryKey: ['admin-stats-badges'] });
    },
  });

  const userName = (item: QueueItem) =>
    item.kind === 'offer'
      ? `${item.offerer.profile?.firstName ?? ''} ${item.offerer.profile?.lastName ?? ''}`
      : `${item.requester.profile?.firstName ?? ''} ${item.requester.profile?.lastName ?? ''}`;

  return (
    <>
      <PageHeader title="Moderazione" subtitle={`${queue.length} elementi in coda`} />

      {queue.length === 0 ? (
        <div className="bg-white rounded-2xl border border-ink-200 p-12 text-center">
          <p className="text-ink-500">Tutto revisionato ✨ La coda è vuota.</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-5 gap-4">
          {/* Queue list */}
          <div className="lg:col-span-2 space-y-3">
            {queue.map(item => (
              <button
                key={item.id}
                onClick={() => setSelectedId(item.id)}
                className={`w-full text-left bg-white rounded-2xl p-4 transition ${
                  selected?.id === item.id ? 'border-2 border-primary-500' : 'border border-ink-200 hover:border-ink-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Badge tone={item.kind === 'offer' ? 'amber' : 'blue'}>
                    {item.kind === 'offer' ? 'Offerta' : 'Richiesta'}
                  </Badge>
                  <span className="text-xs text-ink-400">
                    {new Date(item.createdAt).toLocaleDateString('it-IT')}
                  </span>
                </div>
                <div className="text-sm font-semibold flex items-center gap-1.5">
                  <span>{item.category.icon}</span> {item.title}
                </div>
                <p className="text-xs text-ink-500 mt-1">{userName(item)}</p>
              </button>
            ))}
          </div>

          {/* Detail panel */}
          {selected && (
            <div className="lg:col-span-3 bg-white rounded-2xl border border-ink-200 p-6 h-fit sticky top-24">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{selected.category.icon}</span>
                    <h2 className="font-display text-xl font-semibold">{selected.title}</h2>
                  </div>
                  <p className="text-sm text-ink-500 mt-1">
                    {selected.kind === 'offer' ? 'Offerta' : 'Richiesta'} di {userName(selected)} · {new Date(selected.createdAt).toLocaleDateString('it-IT')}
                  </p>
                </div>
              </div>

              <div className="mt-5 p-4 bg-ink-50 rounded-xl">
                <div className="text-xs font-semibold text-ink-500 uppercase tracking-wider mb-2">Contenuto</div>
                <p className="text-sm text-ink-700 leading-relaxed whitespace-pre-wrap">{selected.description}</p>
              </div>

              <div className="mt-5">
                <label className="text-xs font-semibold text-ink-500 uppercase tracking-wider">Nota interna (opzionale)</label>
                <textarea
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  className="w-full mt-2 border border-ink-200 rounded-xl p-3 text-sm outline-none focus:border-primary-500 transition"
                  rows={2}
                  placeholder="Aggiungi una nota per il team…"
                />
              </div>

              <div className="flex gap-2 mt-5">
                <button
                  onClick={() => decide.mutate({ item: selected, action: 'approve' })}
                  disabled={decide.isPending}
                  className="flex-1 bg-sage-600 hover:bg-sage-700 disabled:opacity-50 transition text-white text-sm font-semibold py-3 rounded-xl flex items-center justify-center gap-2"
                ><Check className="w-4 h-4" /> Approva</button>
                <button
                  onClick={() => decide.mutate({ item: selected, action: 'reject' })}
                  disabled={decide.isPending}
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 transition text-white text-sm font-semibold py-3 rounded-xl flex items-center justify-center gap-2"
                ><X className="w-4 h-4" /> Rifiuta</button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
