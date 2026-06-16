import { useId } from 'react';
import type { InputHTMLAttributes, TextareaHTMLAttributes, ReactNode } from 'react';

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
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium text-gray-900">
        {label}
      </label>
      {hint && (
        <p id={hintId} className="text-xs text-gray-500">
          {hint}
        </p>
      )}
      {children({ id, describedBy, invalid: Boolean(error) })}
      {error && (
        <p id={errorId} role="alert" className="text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

const controlClasses =
  'rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600 aria-[invalid=true]:border-red-500';

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
          className={`${controlClasses} ${className}`}
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
          className={`${controlClasses} ${className}`}
          {...props}
        />
      )}
    </Field>
  );
}
