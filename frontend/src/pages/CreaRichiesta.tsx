import { useForm } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import type { Category, Frequency, Urgency } from '../types';

const DAYS = [
  { code: 'MON', label: 'L' },
  { code: 'TUE', label: 'M' },
  { code: 'WED', label: 'M' },
  { code: 'THU', label: 'G' },
  { code: 'FRI', label: 'V' },
  { code: 'SAT', label: 'S' },
  { code: 'SUN', label: 'D' },
];

const URGENCY_OPTIONS: { value: Urgency; label: string }[] = [
  { value: 'LOW', label: 'Bassa' },
  { value: 'NORMAL', label: 'Normale' },
  { value: 'HIGH', label: 'Alta' },
  { value: 'URGENT', label: 'Urgente' },
];

interface FormData {
  categoryId: string;
  title: string;
  description: string;
  motivation?: string;
  urgency: Urgency;
  frequency: Frequency;
  zone: string;
  city: string;
  zipCode: string;
  timeFrom?: string;
  timeTo?: string;
}

export default function CreaRichiesta() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [params] = useSearchParams();
  const preselectedSlug = params.get('categoria');

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => (await api.get<Category[]>('/categories')).data,
  });

  const [selectedDays, setSelectedDays] = useState<string[]>(['SAT']);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, watch, setValue, formState: { isSubmitting } } = useForm<FormData>({
    defaultValues: { frequency: 'ONE_TIME', urgency: 'NORMAL', city: 'Roma', zipCode: '00153', zone: 'Trastevere' },
  });
  const frequency = watch('frequency');
  const urgency = watch('urgency');

  // Prefill category if the user arrived from an offer page (e.g. ?categoria=ripetizioni)
  useEffect(() => {
    if (preselectedSlug && categories.length > 0) {
      const match = categories.find(c => c.slug === preselectedSlug);
      if (match) setValue('categoryId', match.id);
    }
  }, [preselectedSlug, categories, setValue]);

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      const res = await api.post('/requests', { ...data, preferredDays: selectedDays });
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-requests'] });
      navigate('/mie-richieste');
    },
    onError: (e: any) => setError(e.response?.data?.error ?? 'Errore durante la creazione'),
  });

  function toggleDay(code: string) {
    setSelectedDays(d => d.includes(code) ? d.filter(x => x !== code) : [...d, code]);
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="font-display text-4xl md:text-5xl font-semibold leading-tight">Chiedi aiuto</h1>
      <p className="text-lg text-ink-600 mt-3">Descrivi di cosa hai bisogno — un vicino ti risponderà.</p>

      <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="mt-10 space-y-8">
        <div>
          <label className="block text-xs font-semibold text-ink-500 tracking-wider uppercase mb-3">Categoria</label>
          <select {...register('categoryId', { required: true })} className="w-full border border-ink-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary-500 transition">
            <option value="">Scegli una categoria…</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-ink-500 tracking-wider uppercase mb-3">Titolo</label>
          <input {...register('title', { required: true, minLength: 3 })} className="w-full border border-ink-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary-500 transition" placeholder="es. Aiuto con la spesa settimanale" />
        </div>

        <div>
          <label className="block text-xs font-semibold text-ink-500 tracking-wider uppercase mb-3">Descrizione</label>
          <textarea {...register('description', { required: true, minLength: 10 })} rows={5} className="w-full border border-ink-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary-500 transition" placeholder="Di cosa hai bisogno, quando, come possiamo esserti utili…" />
        </div>

        <div>
          <label className="block text-xs font-semibold text-ink-500 tracking-wider uppercase mb-3">Motivazione (opzionale)</label>
          <textarea {...register('motivation')} rows={3} className="w-full border border-ink-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary-500 transition" placeholder="Se vuoi, spiega il contesto — aiuta i vicini a capire come esserti utili." />
        </div>

        <div>
          <label className="block text-xs font-semibold text-ink-500 tracking-wider uppercase mb-3">Urgenza</label>
          <div className="flex gap-2 flex-wrap">
            {URGENCY_OPTIONS.map(u => (
              <label key={u.value} className="cursor-pointer">
                <input type="radio" value={u.value} {...register('urgency')} className="sr-only peer" />
                <div className={`px-6 py-3 rounded-full font-medium transition ${urgency === u.value ? 'bg-primary-500 text-white shadow-soft-sm' : 'bg-white border border-ink-200 text-ink-700'}`}>
                  {u.label}
                </div>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-ink-500 tracking-wider uppercase mb-3">Frequenza</label>
          <div className="flex gap-2 flex-wrap">
            {(['ONE_TIME','WEEKLY','FLEXIBLE'] as Frequency[]).map(f => (
              <label key={f} className="cursor-pointer">
                <input type="radio" value={f} {...register('frequency')} className="sr-only peer" />
                <div className={`px-6 py-3 rounded-full font-medium transition ${frequency === f ? 'bg-primary-500 text-white shadow-soft-sm' : 'bg-white border border-ink-200 text-ink-700'}`}>
                  {f === 'WEEKLY' ? 'Settimanale' : f === 'ONE_TIME' ? 'Una sola volta' : 'Flessibile'}
                </div>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-ink-500 tracking-wider uppercase mb-3">Giorni preferiti</label>
          <div className="flex gap-2 flex-wrap">
            {DAYS.map(d => (
              <button
                type="button"
                key={d.code}
                onClick={() => toggleDay(d.code)}
                className={`w-14 h-14 rounded-full font-semibold transition ${
                  selectedDays.includes(d.code)
                    ? 'bg-primary-500 text-white shadow-soft-sm'
                    : 'bg-white border border-ink-200 text-ink-700 hover:bg-ink-50'
                }`}
              >{d.label}</button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-ink-500 tracking-wider uppercase mb-3">Dalle</label>
            <input type="time" {...register('timeFrom')} className="w-full border border-ink-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary-500 transition" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-ink-500 tracking-wider uppercase mb-3">Alle</label>
            <input type="time" {...register('timeTo')} className="w-full border border-ink-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary-500 transition" />
          </div>
        </div>

        <div className="grid grid-cols-[2fr_1fr_1fr] gap-3">
          <div>
            <label className="block text-xs font-semibold text-ink-500 tracking-wider uppercase mb-3">Zona</label>
            <input {...register('zone', { required: true })} className="w-full border border-ink-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary-500 transition" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-ink-500 tracking-wider uppercase mb-3">Città</label>
            <input {...register('city', { required: true })} className="w-full border border-ink-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary-500 transition" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-ink-500 tracking-wider uppercase mb-3">CAP</label>
            <input {...register('zipCode', { required: true })} className="w-full border border-ink-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary-500 transition" />
          </div>
        </div>

        {error && <div className="bg-red-50 text-red-700 text-sm rounded-xl px-4 py-3">{error}</div>}

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-ink-200">
          <button type="button" onClick={() => navigate(-1)} className="text-ink-700 font-medium px-6 py-3 rounded-xl hover:bg-ink-50 transition">Annulla</button>
          <button type="submit" disabled={isSubmitting} className="bg-primary-500 hover:bg-primary-600 disabled:opacity-60 transition text-white font-semibold px-8 py-3 rounded-xl shadow-soft">
            {isSubmitting ? 'Invio…' : 'Invia richiesta'}
          </button>
        </div>
      </form>
    </div>
  );
}