import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { ArrowLeftRight, Link2, Check, X, Play, RotateCcw } from 'lucide-react';
import { api } from '../../lib/api';
import { PageHeader, Badge, Avatar } from './ui';

interface AdminOffer {
  id: string; title: string; zone: string; createdAt: string;
  category: { icon: string; name: string };
  offerer: { email: string; profile: { firstName: string; lastName: string } | null };
}
interface AdminRequest {
  id: string; title: string; urgency: string; zone: string; createdAt: string;
  category: { icon: string; name: string };
  requester: { email: string; profile: { firstName: string; lastName: string } | null };
}
interface AdminMatch {
  id: string; status: string; createdAt: string;
  offer: { title: string; category: { icon: string; name: string } };
  request: { title: string };
  offerer: { profile: { firstName: string; lastName: string } | null };
  requester: { profile: { firstName: string; lastName: string } | null };
}

const STATUS_LABEL: Record<string, string> = {
  SUGGESTED: 'Suggerito', ACCEPTED: 'Accettato', DECLINED: 'Rifiutato',
  IN_PROGRESS: 'In corso', COMPLETED: 'Completato', CANCELLED: 'Annullato',
};
const STATUS_TONE: Record<string, 'green' | 'amber' | 'blue' | 'red' | 'gray'> = {
  SUGGESTED: 'amber', ACCEPTED: 'green', IN_PROGRESS: 'blue',
  COMPLETED: 'green', DECLINED: 'red', CANCELLED: 'gray',
};

export default function AdminMatch() {
  const qc = useQueryClient();
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: offers = [], isLoading: loadingOffers } = useQuery<AdminOffer[]>({
    queryKey: ['admin-offers', 'APPROVED'],
    queryFn: async () => (await api.get('/admin/offers', { params: { status: 'APPROVED' } })).data,
  });

  const { data: requests = [], isLoading: loadingRequests } = useQuery<AdminRequest[]>({
    queryKey: ['admin-requests', 'WAITING_MATCH'],
    queryFn: async () => (await api.get('/admin/requests', { params: { status: 'WAITING_MATCH' } })).data,
  });

  const { data: matches = [], isLoading: loadingMatches } = useQuery<AdminMatch[]>({
    queryKey: ['admin-matches'],
    queryFn: async () => (await api.get('/admin/matches')).data,
  });

  const createMatch = useMutation({
    mutationFn: async () =>
      (await api.post('/admin/matches', { offerId: selectedOfferId, requestId: selectedRequestId })).data,
    onSuccess: () => {
      setSelectedOfferId(null);
      setSelectedRequestId(null);
      setError(null);
      qc.invalidateQueries({ queryKey: ['admin-matches'] });
      qc.invalidateQueries({ queryKey: ['admin-stats'] });
    },
    onError: (e: any) => setError(e.response?.data?.error ?? 'Errore nella creazione del match'),
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) =>
      (await api.patch(`/admin/matches/${id}`, { status })).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-matches'] }),
  });

  const userName = (p: { firstName: string; lastName: string } | null) =>
    p ? `${p.firstName} ${p.lastName?.[0] ?? ''}.` : '—';

  return (
    <>
      <PageHeader
        title="Match Engine — Abbinamento manuale"
        subtitle="Seleziona un'offerta e una richiesta, poi crea il match"
      />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-6">
          {error}
        </div>
      )}

      {/* Picker */}
      <div className="grid lg:grid-cols-[1fr_auto_1fr] gap-4 items-start mb-10">
        {/* Offers column */}
        <div className="bg-white rounded-2xl border border-ink-200 p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <span className="text-xs bg-primary-50 text-primary-700 px-2 py-0.5 rounded-full font-semibold">
              {offers.length}
            </span>
            Offerte approvate
          </h3>
          {loadingOffers && <p className="text-sm text-ink-400">Caricamento…</p>}
          {!loadingOffers && offers.length === 0 && (
            <p className="text-sm text-ink-400">Nessuna offerta approvata disponibile.</p>
          )}
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {offers.map(o => (
              <button
                key={o.id}
                onClick={() => setSelectedOfferId(o.id === selectedOfferId ? null : o.id)}
                className={`w-full text-left p-3 rounded-xl transition ${
                  selectedOfferId === o.id
                    ? 'border-2 border-primary-500 bg-primary-50'
                    : 'border border-ink-200 hover:border-ink-300'
                }`}
              >
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <span>{o.category.icon}</span> {o.title}
                </div>
                <div className="text-xs text-ink-500 mt-1">
                  {userName(o.offerer.profile)} · {o.zone}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Center action */}
        <div className="lg:sticky lg:top-24 flex lg:flex-col items-center justify-center gap-3 py-4">
          <div className="w-12 h-12 rounded-full bg-ink-900 grid place-items-center">
            <ArrowLeftRight className="w-5 h-5 text-white" />
          </div>
          <button
            onClick={() => createMatch.mutate()}
            disabled={!selectedOfferId || !selectedRequestId || createMatch.isPending}
            className="bg-primary-500 hover:bg-primary-600 disabled:opacity-40 disabled:cursor-not-allowed transition text-white text-sm font-semibold px-5 py-3 rounded-xl shadow-soft flex items-center gap-2 whitespace-nowrap"
          >
            <Link2 className="w-4 h-4" />
            {createMatch.isPending ? 'Creazione…' : 'Crea Match'}
          </button>
        </div>

        {/* Requests column */}
        <div className="bg-white rounded-2xl border border-ink-200 p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <span className="text-xs bg-sage-50 text-sage-700 px-2 py-0.5 rounded-full font-semibold">
              {requests.length}
            </span>
            Richieste in attesa di match
          </h3>
          {loadingRequests && <p className="text-sm text-ink-400">Caricamento…</p>}
          {!loadingRequests && requests.length === 0 && (
            <p className="text-sm text-ink-400">Nessuna richiesta in attesa disponibile.</p>
          )}
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {requests.map(r => (
              <button
                key={r.id}
                onClick={() => setSelectedRequestId(r.id === selectedRequestId ? null : r.id)}
                className={`w-full text-left p-3 rounded-xl transition ${
                  selectedRequestId === r.id
                    ? 'border-2 border-sage-500 bg-sage-50'
                    : 'border border-ink-200 hover:border-ink-300'
                }`}
              >
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <span>{r.category.icon}</span> {r.title}
                </div>
                <div className="text-xs text-ink-500 mt-1">
                  {userName(r.requester.profile)} · {r.zone}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Existing matches */}
      <h2 className="font-display text-2xl font-semibold mb-4">Match creati ({matches.length})</h2>

      {loadingMatches && <p className="text-ink-500">Caricamento…</p>}
      {!loadingMatches && matches.length === 0 && (
        <div className="bg-white rounded-2xl border border-ink-200 p-12 text-center">
          <p className="text-ink-500">Nessun match creato ancora. Seleziona un'offerta e una richiesta qui sopra.</p>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {matches.map(m => (
          <div key={m.id} className="bg-white rounded-2xl border border-ink-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-2xl">{m.offer.category.icon}</span>
              <div className="flex items-center gap-2">
                <Badge tone="gray">Abbinamento manuale</Badge>
                <Badge tone={STATUS_TONE[m.status] ?? 'gray'}>{STATUS_LABEL[m.status] ?? m.status}</Badge>
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

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-ink-100">
              <span className="text-xs text-ink-400">
                Creato il {new Date(m.createdAt).toLocaleDateString('it-IT')}
              </span>
              <div className="flex gap-1.5">
                {m.status === 'SUGGESTED' && (
                  <>
                    <button
                      onClick={() => updateStatus.mutate({ id: m.id, status: 'ACCEPTED' })}
                      className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-sage-50 text-sage-700 hover:bg-sage-100 flex items-center gap-1"
                    ><Check className="w-3.5 h-3.5" /> Accetta</button>
                    <button
                      onClick={() => updateStatus.mutate({ id: m.id, status: 'DECLINED' })}
                      className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 flex items-center gap-1"
                    ><X className="w-3.5 h-3.5" /> Rifiuta</button>
                  </>
                )}
                {m.status === 'ACCEPTED' && (
                  <>
                    <button
                      onClick={() => updateStatus.mutate({ id: m.id, status: 'IN_PROGRESS' })}
                      className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 flex items-center gap-1"
                    ><Play className="w-3.5 h-3.5" /> Avvia</button>
                    <button
                      onClick={() => updateStatus.mutate({ id: m.id, status: 'CANCELLED' })}
                      className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-ink-100 text-ink-600 hover:bg-ink-200 flex items-center gap-1"
                    ><RotateCcw className="w-3.5 h-3.5" /> Annulla</button>
                  </>
                )}
                {m.status === 'IN_PROGRESS' && (
                  <button
                    onClick={() => updateStatus.mutate({ id: m.id, status: 'COMPLETED' })}
                    className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-sage-50 text-sage-700 hover:bg-sage-100 flex items-center gap-1"
                  ><Check className="w-3.5 h-3.5" /> Completa</button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}