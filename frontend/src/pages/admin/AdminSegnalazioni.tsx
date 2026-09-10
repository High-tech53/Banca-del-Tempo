import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { PageHeader, TableShell, Badge, statusTone, statusLabel, Avatar } from './ui';

interface AdminFlag {
  id: string; reason: string; severity: string; status: string; createdAt: string;
  reporter: { profile: { firstName: string; lastName: string } | null };
  reportedUser: { profile: { firstName: string; lastName: string } | null } | null;
}

function severityTone(s: string) {
  if (s === 'HIGH') return 'red' as const;
  if (s === 'MEDIUM') return 'amber' as const;
  return 'gray' as const;
}
const severityLabel: Record<string, string> = { HIGH: 'Alta', MEDIUM: 'Media', LOW: 'Bassa' };

export default function AdminSegnalazioni() {
  const qc = useQueryClient();
  const { data: flags = [], isLoading } = useQuery<AdminFlag[]>({
    queryKey: ['admin-flags'],
    queryFn: async () => (await api.get('/admin/flags')).data,
  });

  const update = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) =>
      (await api.patch(`/admin/flags/${id}`, { status })).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-flags'] });
      qc.invalidateQueries({ queryKey: ['admin-stats-badges'] });
    },
  });

  return (
    <>
      <PageHeader title="Segnalazioni" subtitle={`${flags.filter(f => f.status === 'OPEN').length} aperte di ${flags.length} totali`} />

      {isLoading ? <div className="text-ink-500">Caricamento…</div> :
        flags.length === 0 ? (
          <div className="bg-white rounded-2xl border border-ink-200 p-12 text-center">
            <p className="text-ink-500">Nessuna segnalazione. Ottimo segno per la community. 💚</p>
          </div>
        ) : (
        <TableShell headers={['Severità', 'Segnalato da', 'Utente segnalato', 'Motivo', 'Stato', 'Data', 'Azioni']}>
          {flags.map(f => (
            <tr key={f.id} className="border-t border-ink-100 hover:bg-ink-50 transition">
              <td className="px-4 py-3"><Badge tone={severityTone(f.severity)}>{severityLabel[f.severity]}</Badge></td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <Avatar name={f.reporter.profile?.firstName} />
                  <span className="text-sm">{f.reporter.profile?.firstName}</span>
                </div>
              </td>
              <td className="px-4 py-3">
                {f.reportedUser ? (
                  <div className="flex items-center gap-2">
                    <Avatar name={f.reportedUser.profile?.firstName} />
                    <span className="text-sm">{f.reportedUser.profile?.firstName}</span>
                  </div>
                ) : <span className="text-sm text-ink-400">Contenuto</span>}
              </td>
              <td className="px-4 py-3 text-sm text-ink-600 max-w-[240px] truncate">{f.reason}</td>
              <td className="px-4 py-3"><Badge tone={statusTone(f.status)}>{statusLabel(f.status)}</Badge></td>
              <td className="px-4 py-3 text-sm text-ink-500 whitespace-nowrap">
                {new Date(f.createdAt).toLocaleDateString('it-IT')}
              </td>
              <td className="px-4 py-3">
                {(f.status === 'OPEN' || f.status === 'IN_REVIEW') && (
                  <div className="flex gap-1 justify-end">
                    <button
                      onClick={() => update.mutate({ id: f.id, status: 'RESOLVED' })}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-sage-50 text-sage-700 hover:bg-sage-100 transition"
                    >Risolvi</button>
                    <button
                      onClick={() => update.mutate({ id: f.id, status: 'DISMISSED' })}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-ink-100 text-ink-600 hover:bg-ink-200 transition"
                    >Archivia</button>
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
