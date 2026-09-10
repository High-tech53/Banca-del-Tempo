import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { api } from '../lib/api';
import type { HelpRequest } from '../types';

const STATUS_LABELS: Record<string, string> = {
  PENDING_REVIEW: 'In revisione',
  APPROVED: 'Approvata',
  WAITING_MATCH: 'In attesa di un vicino',
  MATCHED: 'Match trovato',
  IN_PROGRESS: 'In corso',
  COMPLETED: 'Completata',
  REJECTED: 'Rifiutata',
  EXPIRED: 'Scaduta',
  WITHDRAWN: 'Ritirata',
  DRAFT: 'Bozza',
};

const URGENCY_LABELS: Record<string, string> = { LOW: 'Bassa', NORMAL: 'Normale', HIGH: 'Alta', URGENT: 'Urgente' };

export default function MieRichieste() {
  const { data: requests = [], isLoading } = useQuery<HelpRequest[]>({
    queryKey: ['my-requests'],
    queryFn: async () => (await api.get<HelpRequest[]>('/requests/mine/list')).data,
  });

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex items-end justify-between flex-wrap gap-4 mb-6">
        <div>
          <h1 className="font-display text-4xl font-semibold">Le mie richieste</h1>
          <p className="text-ink-500 mt-1">Segui lo stato di ciò che hai chiesto alla comunità.</p>
        </div>
        <Link to="/crea-richiesta" className="bg-primary-500 hover:bg-primary-600 transition text-white font-semibold px-5 py-3 rounded-xl shadow-soft flex items-center gap-2">
          <Plus className="w-4 h-4" /> Nuova richiesta
        </Link>
      </div>

      {isLoading && <div className="text-ink-500">Caricamento…</div>}

      {!isLoading && requests.length === 0 && (
        <div className="bg-white rounded-2xl border border-ink-200 p-12 text-center">
          <p className="text-ink-500">Non hai ancora fatto una richiesta.</p>
          <Link to="/crea-richiesta" className="inline-block mt-4 text-primary-600 font-semibold">Chiedi il tuo primo aiuto →</Link>
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {requests.map(r => (
          <div key={r.id} className="bg-white rounded-2xl border border-ink-200 overflow-hidden">
            <div className="h-24 bg-gradient-to-br from-sage-100 to-sage-50 relative grid place-items-center">
              <span className="text-4xl">{r.category.icon}</span>
              <span className={`absolute top-3 right-3 text-xs font-semibold px-2.5 py-1 rounded-full ${
                r.status === 'APPROVED' || r.status === 'WAITING_MATCH' ? 'bg-sage-50 text-sage-700' :
                r.status === 'PENDING_REVIEW' ? 'bg-primary-50 text-primary-700' :
                'bg-ink-100 text-ink-600'
              }`}>
                {STATUS_LABELS[r.status] ?? r.status}
              </span>
              {r.urgency !== 'NORMAL' && (
                <span className="absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full bg-white/90 text-ink-700">
                  {URGENCY_LABELS[r.urgency]}
                </span>
              )}
            </div>
            <div className="p-5">
              <h3 className="font-semibold line-clamp-1">{r.title}</h3>
              <p className="text-sm text-ink-500 mt-1 line-clamp-2">{r.description}</p>
              <div className="text-xs text-ink-500 mt-3">{r.zone} · {r.category.name}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}