import { Loader2 } from 'lucide-react';

/** Small spinning icon. Use it inside buttons, inputs, or anywhere inline. */
export function Spinner({ className = 'w-5 h-5' }: { className?: string }) {
  return <Loader2 className={`animate-spin ${className}`} aria-hidden="true" />;
}

/** Centered spinner for a whole section/page. The label is only read by screen readers. */
export function PageLoader({ label = 'Caricamento…' }: { label?: string }) {
  return (
    <div role="status" aria-live="polite" className="flex items-center justify-center py-24">
      <Spinner className="w-9 h-9 text-primary-500" />
      <span className="sr-only">{label}</span>
    </div>
  );
}
