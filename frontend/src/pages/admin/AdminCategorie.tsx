import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Plus } from 'lucide-react';
import { api } from '../../lib/api';
import { PageHeader, Badge } from './ui';

interface AdminCategory {
  id: string; slug: string; name: string; icon: string; active: boolean; sortOrder: number;
  _count: { offers: number; requests: number };
}

export default function AdminCategorie() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', slug: '', icon: '📦' });
  const [error, setError] = useState<string | null>(null);

  const { data: cats = [], isLoading } = useQuery<AdminCategory[]>({
    queryKey: ['admin-categories'],
    queryFn: async () => (await api.get('/admin/categories')).data,
  });

  const create = useMutation({
    mutationFn: async () => (await api.post('/admin/categories', form)).data,
    onSuccess: () => {
      setShowForm(false);
      setForm({ name: '', slug: '', icon: '📦' });
      setError(null);
      qc.invalidateQueries({ queryKey: ['admin-categories'] });
      qc.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (e: any) => setError(e.response?.data?.error ?? 'Errore'),
  });

  const toggle = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) =>
      (await api.patch(`/admin/categories/${id}`, { active })).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-categories'] });
      qc.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  return (
    <>
      <PageHeader
        title="Categorie"
        subtitle={`${cats.filter(c => c.active).length} attive di ${cats.length}`}
        action={
          <button
            onClick={() => setShowForm(s => !s)}
            className="bg-primary-500 hover:bg-primary-600 transition text-white text-sm font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2"
          ><Plus className="w-4 h-4" /> Aggiungi categoria</button>
        }
      />

      {showForm && (
        <div className="bg-white rounded-2xl border border-primary-200 p-5 mb-6">
          <div className="grid sm:grid-cols-[80px_1fr_1fr_auto] gap-3 items-end">
            <div>
              <label className="block text-xs font-semibold text-ink-500 mb-1.5">Icona</label>
              <input value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))}
                className="w-full border border-ink-200 rounded-xl px-3 py-2.5 text-center text-lg outline-none focus:border-primary-500" maxLength={4} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink-500 mb-1.5">Nome</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') }))}
                className="w-full border border-ink-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary-500" placeholder="es. Cucina" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink-500 mb-1.5">Slug</label>
              <input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                className="w-full border border-ink-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary-500 font-mono" placeholder="cucina" />
            </div>
            <button onClick={() => create.mutate()} disabled={create.isPending || !form.name || !form.slug}
              className="bg-ink-900 hover:bg-ink-800 disabled:opacity-40 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition">
              Salva
            </button>
          </div>
          {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
        </div>
      )}

      {isLoading ? <div className="text-ink-500">Caricamento…</div> : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cats.map(c => (
            <div key={c.id} className={`bg-white rounded-2xl border border-ink-200 p-5 ${!c.active ? 'opacity-50' : ''}`}>
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-xl bg-primary-50 grid place-items-center text-2xl">{c.icon}</div>
                <Badge tone={c.active ? 'green' : 'gray'}>{c.active ? 'Attiva' : 'Disattivata'}</Badge>
              </div>
              <h3 className="font-semibold mt-4">{c.name}</h3>
              <div className="flex items-center gap-3 mt-2 text-xs text-ink-500">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary-500" /> {c._count.offers} offerte</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-sage-500" /> {c._count.requests} richieste</span>
              </div>
              <button
                onClick={() => toggle.mutate({ id: c.id, active: !c.active })}
                className="mt-4 text-xs font-semibold text-primary-600 hover:text-primary-700 transition"
              >{c.active ? 'Disattiva' : 'Riattiva'}</button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
