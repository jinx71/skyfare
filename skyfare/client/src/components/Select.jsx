import React, { forwardRef } from 'react';
import { useUniqueId } from '../hooks/useUniqueId';

/** Styled <select> that pairs with react-hook-form register(), matching Input. */
const Select = forwardRef(
  (
    { label, error, hint, id, children, className = '', containerClassName = '', required, ...props },
    ref
  ) => {
    const reactId = useUniqueId('select');
    const selectId = id || reactId;

    return (
      <div className={containerClassName}>
        {label && (
          <label htmlFor={selectId} className="mb-1 block text-sm font-medium text-slate-700">
            {label}
            {required && <span className="ml-0.5 text-rose-500">*</span>}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          aria-invalid={Boolean(error)}
          className={[
            'w-full appearance-none rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900',
            'bg-[length:1.1rem] bg-[right_0.75rem_center] bg-no-repeat pr-9',
            'transition-colors focus:outline-none focus:ring-2',
            error
              ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-200'
              : 'border-slate-200 focus:border-sky-400 focus:ring-sky-200',
            className,
          ].join(' ')}
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E\")",
          }}
          {...props}
        >
          {children}
        </select>
        {error ? (
          <p className="mt-1 text-xs font-medium text-rose-600">{error}</p>
        ) : (
          hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
