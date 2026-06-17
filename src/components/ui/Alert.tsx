import type { ReactNode } from 'react';
import { AlertIcon } from './icons';

/** Form-level message block. Use for errors that aren't tied to a single field. */
export function Alert({ children }: { children: ReactNode }) {
  return (
    <div
      role="alert"
      className="flex items-start gap-2.5 rounded-lg border border-clay/30 bg-clay-tint px-3.5 py-3 text-sm text-clay"
    >
      <AlertIcon className="mt-0.5 shrink-0 text-[15px]" />
      <p>{children}</p>
    </div>
  );
}
