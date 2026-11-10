import type { ReactNode } from 'react';
import { SearchX, type LucideIcon } from 'lucide-react';

interface ErrorStateProps {
  /** Big number/word shown above the title, e.g. "404" */
  code?: string;
  title: string;
  message: string;
  icon?: LucideIcon;
  /** Buttons / links shown under the message */
  actions?: ReactNode;
}

/** Friendly "something is missing / went wrong" screen, used inside a page (header stays visible). */
export default function ErrorState({ code, title, message, icon: Icon = SearchX, actions }: ErrorStateProps) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6 py-16">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-primary-50 grid place-items-center">
          <Icon className="w-9 h-9 text-primary-500" />
        </div>
        {code && <div className="font-display text-7xl font-semibold text-primary-500 leading-none mb-3">{code}</div>}
        <h1 className="font-display text-2xl md:text-3xl font-semibold text-ink-900 mb-3">{title}</h1>
        <p className="text-ink-600 leading-relaxed">{message}</p>
        {actions && <div className="flex flex-wrap gap-3 justify-center mt-8">{actions}</div>}
      </div>
    </div>
  );
}
