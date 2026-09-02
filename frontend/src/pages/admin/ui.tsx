import { ReactNode } from 'react';

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="flex items-end justify-between flex-wrap gap-4 mb-6">
      <div>
        <h1 className="font-display text-3xl font-semibold">{title}</h1>
        {subtitle && <p className="text-sm text-ink-500 mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

const BADGE_STYLES: Record<string, string> = {
  green: 'bg-sage-50 text-sage-700',
  amber: 'bg-primary-50 text-primary-700',
  blue: 'bg-blue-50 text-blue-700',
  red: 'bg-red-50 text-red-700',
  gray: 'bg-ink-100 text-ink-600',
};

export function Badge({ tone, children }: { tone: keyof typeof BADGE_STYLES; children: ReactNode }) {
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${BADGE_STYLES[tone]}`}>
      {children}
    </span>
  );
}

export function statusTone(status: string): keyof typeof BADGE_STYLES {
  switch (status) {
    case 'APPROVED': case 'RESOLVED': case 'ACCEPTED': case 'COMPLETED': case 'WAITING_MATCH': return 'green';
    case 'PENDING_REVIEW': case 'PENDING': case 'SUGGESTED': case 'OPEN': return 'amber';
    case 'IN_PROGRESS': case 'IN_REVIEW': case 'MATCHED': return 'blue';
    case 'REJECTED': case 'CANCELLED': case 'DECLINED': return 'red';
    default: return 'gray';
  }
}

export function statusLabel(status: string): string {
  const map: Record<string, string> = {
    PENDING_REVIEW: 'In revisione', APPROVED: 'Approvata', REJECTED: 'Rifiutata',
    IN_PROGRESS: 'In corso', COMPLETED: 'Completata', EXPIRED: 'Scaduta',
    WITHDRAWN: 'Ritirata', DRAFT: 'Bozza', WAITING_MATCH: 'In attesa match',
    MATCHED: 'Match trovato', SUGGESTED: 'Suggerito', PENDING: 'In attesa',
    ACCEPTED: 'Accettato', DECLINED: 'Rifiutato', CANCELLED: 'Annullato',
    OPEN: 'Aperta', IN_REVIEW: 'In esame', RESOLVED: 'Risolta', DISMISSED: 'Archiviata',
    LOW: 'Bassa', NORMAL: 'Normale', HIGH: 'Alta', URGENT: 'Urgente',
  };
  return map[status] ?? status;
}

export function TableShell({ headers, children }: { headers: string[]; children: ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-ink-200 overflow-hidden overflow-x-auto">
      <table className="w-full min-w-[800px]">
        <thead>
          <tr className="bg-ink-50 text-left text-xs font-semibold text-ink-500 uppercase tracking-wider">
            {headers.map(h => <th key={h} className="px-4 py-3">{h}</th>)}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export function KpiCard({ label, value, accent }: { label: string; value: ReactNode; accent?: boolean }) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-ink-200">
      <div className="text-xs font-semibold text-ink-500 tracking-wider uppercase">{label}</div>
      <div className={`font-display text-4xl font-semibold mt-3 ${accent ? 'text-red-600' : ''}`}>{value}</div>
    </div>
  );
}

export function Avatar({ name }: { name?: string }) {
  return (
    <div className="w-8 h-8 rounded-full bg-sage-500 grid place-items-center text-white text-xs font-semibold flex-shrink-0">
      {name?.[0] ?? '?'}
    </div>
  );
}
