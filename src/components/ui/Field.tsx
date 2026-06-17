import { useId } from 'react';
import type { InputHTMLAttributes, TextareaHTMLAttributes, ReactNode } from 'react';
import { AlertIcon } from './icons';

interface BaseFieldProps {
  label: string;
  error?: string;
  hint?: string;
  children: (props: { id: string; describedBy?: string; invalid: boolean }) => ReactNode;
}

/** Accessible label + control wrapper: ties label, hint, and error to the control via ARIA. */
function Field({ label, error, hint, children }: BaseFieldProps) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-ink">
        {label}
      </label>
      {hint && !error && (
        <p id={hintId} className="text-xs text-ink-muted">
          {hint}
        </p>
      )}
      {children({ id, describedBy, invalid: Boolean(error) })}
      {error && (
        <p id={errorId} role="alert" className="flex items-center gap-1.5 text-xs text-clay">
          <AlertIcon className="shrink-0 text-[13px]" />
          {error}
        </p>
      )}
    </div>
  );
}

const controlBase =
  'rounded-lg border bg-paper px-3 py-2 text-sm text-ink shadow-sm transition-colors placeholder:text-ink-muted/60 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:cursor-not-allowed disabled:bg-surface-raised disabled:text-ink-muted';

function controlClasses(invalid: boolean): string {
  return invalid
    ? `${controlBase} border-clay focus:border-clay focus:ring-clay/30`
    : `${controlBase} border-line focus:border-pine focus:ring-pine/25`;
}

type InputFieldProps = { label: string; error?: string; hint?: string } & Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'id'
>;

export function InputField({ label, error, hint, className = '', ...props }: InputFieldProps) {
  return (
    <Field label={label} error={error} hint={hint}>
      {({ id, describedBy, invalid }) => (
        <input
          id={id}
          aria-describedby={describedBy}
          aria-invalid={invalid}
          className={`${controlClasses(invalid)} ${className}`}
          {...props}
        />
      )}
    </Field>
  );
}

type TextareaFieldProps = { label: string; error?: string; hint?: string } & Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  'id'
>;

export function TextareaField({
  label,
  error,
  hint,
  className = '',
  rows = 4,
  ...props
}: TextareaFieldProps) {
  return (
    <Field label={label} error={error} hint={hint}>
      {({ id, describedBy, invalid }) => (
        <textarea
          id={id}
          rows={rows}
          aria-describedby={describedBy}
          aria-invalid={invalid}
          className={`${controlClasses(invalid)} resize-y ${className}`}
          {...props}
        />
      )}
    </Field>
  );
}
