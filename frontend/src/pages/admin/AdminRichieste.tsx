import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Check, X } from 'lucide-react';
import { api } from '../../lib/api';
import { PageHeader, TableShell, Badge, statusTone, statusLabel, Avatar } from './ui';

interface AdminRequest {
  id: string; title: string; status: string; urgency: string; zone: string; createdAt: string;
  category: { icon: string; name: string };
  requester: { email: string; profile: { firstName: string; lastName: string } | null };
}

const FILTERS = ['', 'PENDING_REVIEW', 'WAITING_MATCH', 'MATCHED', 'COMPLETED', 'REJECTED'];

function urgencyTone(u: string) {
  if (u === 'URGENT') return 'red' as const;
  if (u === 'HIGH') return 'amber' as const;
  return 'gray' as const;
}

export default function AdminRichieste() {
  const [filter, setFilter] = useState('PENDING_REVIEW');
  const qc = useQueryClient();

  const { data: items = [], isLoading } = useQuery<AdminRequest[]>({
    queryKey: ['admin-requests', filter],
    queryFn: async () => (await api.get('/admin/requests', { params: { status: filter || undefined } })).data,
  });

  const decide = useMutation({
    mutationFn: async ({ id, action }: { id: string; action: 'approve' | 'reject' }) =>
      (await api.patch(`/admin/requests/${id}`, { action })).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-requests'] });
      qc.invalidateQueries({ queryKey: ['admin-stats'] });
      qc.invalidateQueries({ queryKey: ['admin-stats-badges'] });
    },
  });

  return (
    <>
      <PageHeader title="Richieste" subtitle={`${items.length} risultati`} />

      <div className="flex gap-2 mb-6 flex-wrap">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-sm font-medium px-4 py-2 rounded-full transition ${
              filter === f ? 'bg-primary-500 text-white' : 'bg-white border border-ink-200 text-ink-700 hover:bg-ink-50'
            }`}
          >{f === '' ? 'Tutte' : statusLabel(f)}</button>
        ))}
      </div>

      {isLoading ? <div className="text-ink-500">Caricamento…</div> : (
        <TableShell headers={['Titolo', 'Utente', 'Urgenza', 'Stato', 'Data', 'Azioni']}>
          {items.length === 0 && (
            <tr><td colSpan={6} className="px-4 py-10 text-center text-ink-400">Nessuna richiesta con questo stato.</td></tr>
          )}
          {items.map(r => (
            <tr key={r.id} className="border-t border-ink-100 hover:bg-ink-50 transition">
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{r.category.icon}</span>
                  <span className="text-sm font-medium">{r.title}</span>
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <Avatar name={r.requester.profile?.firstName} />
                  <span className="text-sm">{r.requester.profile?.firstName} {r.requester.profile?.lastName?.[0]}.</span>
                </div>
              </td>
              <td className="px-4 py-3"><Badge tone={urgencyTone(r.urgency)}>{statusLabel(r.urgency)}</Badge></td>
              <td className="px-4 py-3"><Badge tone={statusTone(r.status)}>{statusLabel(r.status)}</Badge></td>
              <td className="px-4 py-3 text-sm text-ink-500 whitespace-nowrap">
                {new Date(r.createdAt).toLocaleDateString('it-IT')}
              </td>
              <td className="px-4 py-3">
                {r.status === 'PENDING_REVIEW' && (
                  <div className="flex items-center gap-1 justify-end">
                    <button onClick={() => decide.mutate({ id: r.id, action: 'approve' })} disabled={decide.isPending}
                      className="w-8 h-8 grid place-items-center rounded-lg hover:bg-sage-50 transition text-sage-600 disabled:opacity-40" title="Approva">
                      <Check className="w-4 h-4" />
                    </button>
                    <button onClick={() => decide.mutate({ id: r.id, action: 'reject' })} disabled={decide.isPending}
                      className="w-8 h-8 grid place-items-center rounded-lg hover:bg-red-50 transition text-red-500 disabled:opacity-40" title="Rifiuta">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </TableShell>
      )}
    </>
  );
}
