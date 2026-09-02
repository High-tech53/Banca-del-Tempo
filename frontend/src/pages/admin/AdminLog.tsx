import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { PageHeader, TableShell, Avatar } from './ui';

interface AuditEntry {
  id: string; action: string; entityType: string | null; entityId: string | null; createdAt: string;
  actor: { email: string; profile: { firstName: string; lastName: string } | null } | null;
}

const ACTION_LABELS: Record<string, string> = {
  OFFER_APPROVED: 'ha approvato un\'offerta',
  OFFER_REJECTED: 'ha rifiutato un\'offerta',
  REQUEST_APPROVED: 'ha approvato una richiesta',
  REQUEST_REJECTED: 'ha rifiutato una richiesta',
  USER_SUSPENDED: 'ha sospeso un utente',
  USER_RESTORED: 'ha riattivato un utente',
  CATEGORY_CREATED: 'ha creato una categoria',
  CATEGORY_UPDATED: 'ha modificato una categoria',
  FLAG_RESOLVED: 'ha risolto una segnalazione',
  FLAG_DISMISSED: 'ha archiviato una segnalazione',
  FLAG_IN_REVIEW: 'ha preso in carico una segnalazione',
};

export default function AdminLog() {
  const { data: logs = [], isLoading } = useQuery<AuditEntry[]>({
    queryKey: ['admin-audit-log'],
    queryFn: async () => (await api.get('/admin/audit-log')).data,
  });

  return (
    <>
      <PageHeader title="Log attività" subtitle="Registro delle azioni amministrative — ultime 100" />

      {isLoading ? <div className="text-ink-500">Caricamento…</div> :
        logs.length === 0 ? (
          <div className="bg-white rounded-2xl border border-ink-200 p-12 text-center">
            <p className="text-ink-500">Nessuna azione registrata ancora. Le azioni appariranno qui quando approvi/rifiuti contenuti o gestisci utenti.</p>
          </div>
        ) : (
        <TableShell headers={['Timestamp', 'Attore', 'Azione', 'Oggetto']}>
          {logs.map(l => (
            <tr key={l.id} className="border-t border-ink-100 hover:bg-ink-50 transition">
              <td className="px-4 py-3 text-sm text-ink-500 whitespace-nowrap">
                {new Date(l.createdAt).toLocaleString('it-IT', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <Avatar name={l.actor?.profile?.firstName ?? 'S'} />
                  <span className="text-sm">{l.actor?.profile?.firstName ?? 'Sistema'} {l.actor?.profile?.lastName ?? ''}</span>
                </div>
              </td>
              <td className="px-4 py-3 text-sm">{ACTION_LABELS[l.action] ?? l.action}</td>
              <td className="px-4 py-3 text-sm text-ink-500 font-mono">
                {l.entityType} {l.entityId ? `#${l.entityId.slice(0, 8)}` : ''}
              </td>
            </tr>
          ))}
        </TableShell>
      )}
    </>
  );
}
