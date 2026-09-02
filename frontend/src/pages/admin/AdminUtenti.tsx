import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Search, Ban, RotateCcw } from 'lucide-react';
import { api } from '../../lib/api';
import { useAuthStore } from '../../store/auth';
import { PageHeader, TableShell, Badge, Avatar } from './ui';

interface AdminUser {
  id: string; email: string; role: string; accountKind: string; suspended: boolean; createdAt: string;
  profile: { firstName: string; lastName: string; city: string; verificationStatus: string; helpsCompleted: number; ratingAverage: number } | null;
  _count: { flagsAgainst: number };
}

export default function AdminUtenti() {
  const [search, setSearch] = useState('');
  const qc = useQueryClient();
  const currentUser = useAuthStore(s => s.user);

  const { data: users = [], isLoading } = useQuery<AdminUser[]>({
    queryKey: ['admin-users', search],
    queryFn: async () => (await api.get('/admin/users', { params: { q: search || undefined } })).data,
  });

  const toggleSuspend = useMutation({
    mutationFn: async ({ id, suspended }: { id: string; suspended: boolean }) =>
      (await api.patch(`/admin/users/${id}`, { suspended })).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
  });

  return (
    <>
      <PageHeader title="Utenti" subtitle={`${users.length} risultati`} />

      <div className="bg-white rounded-2xl border border-ink-200 p-4 mb-6 flex items-center gap-2 max-w-md">
        <Search className="w-4 h-4 text-ink-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Cerca per nome o email..."
          className="flex-1 text-sm outline-none"
        />
      </div>

      {isLoading ? <div className="text-ink-500">Caricamento…</div> : (
        <TableShell headers={['Utente', 'Ruolo', 'Verifica', 'Aiuti', 'Flag', 'Iscritto', 'Azioni']}>
          {users.map(u => (
            <tr key={u.id} className={`border-t border-ink-100 hover:bg-ink-50 transition ${u.suspended ? 'opacity-60' : ''}`}>
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <Avatar name={u.profile?.firstName} />
                  <div>
                    <div className="text-sm font-medium">
                      {u.profile?.firstName} {u.profile?.lastName}
                      {u.suspended && <span className="ml-2 text-xs text-red-600 font-semibold">SOSPESO</span>}
                    </div>
                    <div className="text-xs text-ink-500">{u.email}</div>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3">
                <Badge tone={u.role === 'ADMIN' ? 'red' : u.role === 'MODERATOR' ? 'blue' : 'gray'}>{u.role}</Badge>
              </td>
              <td className="px-4 py-3">
                <Badge tone={u.profile?.verificationStatus === 'VERIFIED' ? 'green' : 'gray'}>
                  {u.profile?.verificationStatus === 'VERIFIED' ? 'Verificato' : 'Non verificato'}
                </Badge>
              </td>
              <td className="px-4 py-3 text-sm text-ink-600">
                {u.profile?.helpsCompleted ?? 0} · ★ {u.profile?.ratingAverage?.toFixed(1) ?? '—'}
              </td>
              <td className="px-4 py-3">
                {u._count.flagsAgainst > 0
                  ? <Badge tone="red">{u._count.flagsAgainst} flag</Badge>
                  : <span className="text-sm text-ink-400">—</span>}
              </td>
              <td className="px-4 py-3 text-sm text-ink-500 whitespace-nowrap">
                {new Date(u.createdAt).toLocaleDateString('it-IT', { month: 'short', year: 'numeric' })}
              </td>
              <td className="px-4 py-3">
                {u.id !== currentUser?.id && (
                  <button
                    onClick={() => toggleSuspend.mutate({ id: u.id, suspended: !u.suspended })}
                    disabled={toggleSuspend.isPending}
                    className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition disabled:opacity-40 ${
                      u.suspended
                        ? 'bg-sage-50 text-sage-700 hover:bg-sage-100'
                        : 'bg-red-50 text-red-700 hover:bg-red-100'
                    }`}
                  >
                    {u.suspended ? <><RotateCcw className="w-3.5 h-3.5" /> Riattiva</> : <><Ban className="w-3.5 h-3.5" /> Sospendi</>}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </TableShell>
      )}
    </>
  );
}
