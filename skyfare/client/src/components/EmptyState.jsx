import React from 'react';

/**
 * Shown when a request succeeds but returns nothing. Per the design brief, an
 * empty screen is an invitation to act — so it always offers a next step.
 */
const EmptyState = ({ title = 'Nothing here yet', message, icon, action, className = '' }) => (
  <div
    className={[
      'flex flex-col items-center justify-center rounded-2xl border border-dashed',
      'border-slate-200 bg-white/60 px-6 py-12 text-center',
      className,
    ].join(' ')}
  >
    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-sky-50 text-sky-500">
      {icon || (
        <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5M12 3.75v16.5" />
        </svg>
      )}
    </div>
    <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
    {message && <p className="mt-1 max-w-sm text-sm text-slate-500">{message}</p>}
    {action && <div className="mt-5">{action}</div>}
  </div>
);

export default EmptyState;
