import React from 'react';
import Button from './Button';

/**
 * Error display for failed async views. Names what went wrong in the
 * interface's voice and gives a way to recover (Retry).
 */
const ErrorState = ({ title = 'Something went wrong', message, onRetry, className = '' }) => (
  <div
    role="alert"
    className={[
      'flex flex-col items-center justify-center rounded-2xl border border-rose-100',
      'bg-rose-50/60 px-6 py-12 text-center',
      className,
    ].join(' ')}
  >
    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rose-100 text-rose-600">
      <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.3 3.86l-8 14A1.5 1.5 0 003.6 20h16.8a1.5 1.5 0 001.3-2.14l-8-14a1.5 1.5 0 00-2.6 0z" />
      </svg>
    </div>
    <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
    {message && <p className="mt-1 max-w-md text-sm text-slate-600">{message}</p>}
    {onRetry && (
      <Button variant="secondary" className="mt-5" onClick={onRetry}>
        Try again
      </Button>
    )}
  </div>
);

export default ErrorState;
