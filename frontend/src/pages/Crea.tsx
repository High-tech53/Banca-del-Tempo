import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { api } from '../lib/api';
import type { Category, Frequency, Offer } from '../types';

const DAYS = [
  { code: 'MON', label: 'L' },
  { code: 'TUE', label: 'M' },
  { code: 'WED', label: 'M' },
  { code: 'THU', label: 'G' },
  { code: 'FRI', label: 'V' },
  { code: 'SAT', label: 'S' },
  { code: 'SUN', label: 'D' },
];

interface FormData {
  categoryId: string;
  title: string;
  description: string;
  frequency: Frequency;
  zone: string;
  city: string;
  zipCode: string;
  timeFrom?: string;
  timeTo?: string;
}

export default function Crea() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => (await api.get<Category[]>('/categories')).data,
  });

  const [selectedDays, setSelectedDays] = useState<string[]>(['TUE', 'THU']);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, watch, formState: { isSubmitting } } = useForm<FormData>({
    defaultValues: { frequency: 'WEEKLY', city: 'Roma', zipCode: '00153', zone: 'Trastevere', timeFrom: '16:00', timeTo: '19:00' },
  });
  const frequency = watch('frequency');

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      const res = await api.post<Offer>('/offers', { ...data, availableDays: selectedDays });
      return res.data;
    },
    onSuccess: (offer) => {
      qc.invalidateQueries({ queryKey: ['my-offers'] });
      navigate(`/offerte/${offer.id}`);
    },
    onError: (e: any) => setError(e.response?.data?.error ?? 'Errore durante la creazione'),
  });

  function toggleDay(code: string) {
    setSelectedDays(d => d.includes(code) ? d.filter(x => x !== code) : [...d, code]);
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="font-display text-4xl md:text-5xl font-semibold leading-tight">Crea un'offerta</h1>
      <p className="text-lg text-ink-600 mt-3">Condividi un talento o un'ora del tuo tempo con un vicino.</p>

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
          <input {...register('title', { required: true, minLength: 3 })} className="w-full border border-ink-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary-500 transition" placeholder="es. Ripetizioni di matematica per liceo" />
        </div>

        <div>
          <label className="block text-xs font-semibold text-ink-500 tracking-wider uppercase mb-3">Descrizione</label>
          <textarea {...register('description', { required: true, minLength: 10 })} rows={5} className="w-full border border-ink-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary-500 transition" placeholder="Cosa offri, a chi è utile, come ti piace lavorare…" />
        </div>

        <div>
          <label className="block text-xs font-semibold text-ink-500 tracking-wider uppercase mb-3">Frequenza</label>
          <div className="flex gap-2 flex-wrap">
            {(['WEEKLY','ONE_TIME','FLEXIBLE'] as Frequency[]).map(f => (
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
          <label className="block text-xs font-semibold text-ink-500 tracking-wider uppercase mb-3">Giorni</label>
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
            {isSubmitting ? 'Salvataggio…' : 'Pubblica offerta'}
          </button>
        </div>
      </form>
    </div>
  );
}
