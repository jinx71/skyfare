import React, { forwardRef } from 'react';
import { useUniqueId } from '../hooks/useUniqueId';

/**
 * Labelled text input. forwardRef lets react-hook-form's `register()` attach
 * its ref directly: <Input label="Email" {...register('email')} error={...} />
 */
const Input = forwardRef(
  ({ label, error, hint, id, className = '', containerClassName = '', required, ...props }, ref) => {
    const reactId = useUniqueId('input');
    const inputId = id || reactId;
    const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined;

    return (
      <div className={containerClassName}>
        {label && (
          <label htmlFor={inputId} className="mb-1 block text-sm font-medium text-slate-700">
            {label}
            {required && <span className="ml-0.5 text-rose-500">*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={[
            'w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900',
            'placeholder:text-slate-400 transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-offset-0',
            error
              ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-200'
              : 'border-slate-200 focus:border-sky-400 focus:ring-sky-200',
            'disabled:bg-slate-50 disabled:text-slate-400',
            className,
          ].join(' ')}
          {...props}
        />
        {error ? (
          <p id={`${inputId}-error`} className="mt-1 text-xs font-medium text-rose-600">
            {error}
          </p>
        ) : (
          hint && (
            <p id={`${inputId}-hint`} className="mt-1 text-xs text-slate-400">
              {hint}
            </p>
          )
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
