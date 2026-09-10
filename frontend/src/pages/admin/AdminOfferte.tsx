import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Check, X, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { PageHeader, TableShell, Badge, statusTone, statusLabel, Avatar } from './ui';

interface AdminOffer {
  id: string; title: string; status: string; zone: string; createdAt: string;
  category: { icon: string; name: string };
  offerer: { email: string; profile: { firstName: string; lastName: string } | null };
}

const FILTERS = ['', 'PENDING_REVIEW', 'APPROVED', 'REJECTED', 'COMPLETED'];

export default function AdminOfferte() {
  const [filter, setFilter] = useState('PENDING_REVIEW');
  const qc = useQueryClient();

  const { data: offers = [], isLoading } = useQuery<AdminOffer[]>({
    queryKey: ['admin-offers', filter],
    queryFn: async () => (await api.get('/admin/offers', { params: { status: filter || undefined } })).data,
  });

  const decide = useMutation({
    mutationFn: async ({ id, action }: { id: string; action: 'approve' | 'reject' }) =>
      (await api.patch(`/admin/offers/${id}`, { action })).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-offers'] });
      qc.invalidateQueries({ queryKey: ['admin-stats'] });
      qc.invalidateQueries({ queryKey: ['admin-stats-badges'] });
    },
  });

  return (
    <>
      <PageHeader title="Offerte" subtitle={`${offers.length} risultati`} />

      <div className="flex gap-2 mb-6 flex-wrap">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-sm font-medium px-4 py-2 rounded-full transition ${
              filter === f ? 'bg-primary-500 text-white' : 'bg-white border border-ink-200 text-ink-700 hover:bg-ink-50'
            }`}
          >
            {f === '' ? 'Tutte' : statusLabel(f)}
          </button>
        ))}
      </div>

      {isLoading ? <div className="text-ink-500">Caricamento…</div> : (
        <TableShell headers={['Titolo', 'Categoria', 'Utente', 'Zona', 'Stato', 'Data', 'Azioni']}>
          {offers.length === 0 && (
            <tr><td colSpan={7} className="px-4 py-10 text-center text-ink-400">Nessuna offerta con questo stato.</td></tr>
          )}
          {offers.map(o => (
            <tr key={o.id} className="border-t border-ink-100 hover:bg-ink-50 transition">
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{o.category.icon}</span>
                  <span className="text-sm font-medium">{o.title}</span>
                </div>
              </td>
              <td className="px-4 py-3 text-sm text-ink-600">{o.category.name}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <Avatar name={o.offerer.profile?.firstName} />
                  <span className="text-sm">{o.offerer.profile?.firstName} {o.offerer.profile?.lastName?.[0]}.</span>
                </div>
              </td>
              <td className="px-4 py-3 text-sm text-ink-600">{o.zone}</td>
              <td className="px-4 py-3"><Badge tone={statusTone(o.status)}>{statusLabel(o.status)}</Badge></td>
              <td className="px-4 py-3 text-sm text-ink-500 whitespace-nowrap">
                {new Date(o.createdAt).toLocaleDateString('it-IT')}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-1 justify-end">
                  <Link to={`/offerte/${o.id}`} className="w-8 h-8 grid place-items-center rounded-lg hover:bg-ink-100 transition text-ink-500" title="Vedi">
                    <Eye className="w-4 h-4" />
                  </Link>
                  {o.status === 'PENDING_REVIEW' && (
                    <>
                      <button
                        onClick={() => decide.mutate({ id: o.id, action: 'approve' })}
                        disabled={decide.isPending}
                        className="w-8 h-8 grid place-items-center rounded-lg hover:bg-sage-50 transition text-sage-600 disabled:opacity-40"
                        title="Approva"
                      ><Check className="w-4 h-4" /></button>
                      <button
                        onClick={() => decide.mutate({ id: o.id, action: 'reject' })}
                        disabled={decide.isPending}
                        className="w-8 h-8 grid place-items-center rounded-lg hover:bg-red-50 transition text-red-500 disabled:opacity-40"
                        title="Rifiuta"
                      ><X className="w-4 h-4" /></button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </TableShell>
      )}
    </>
  );
}
