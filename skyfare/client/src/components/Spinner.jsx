import React from 'react';

const SIZES = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-9 w-9' };

const Spinner = ({ size = 'md', className = '', label = 'Loading' }) => (
  <span role="status" aria-live="polite" className={['inline-flex', className].join(' ')}>
    <svg className={[SIZES[size], 'animate-spin text-sky-600'].join(' ')} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
    <span className="sr-only">{label}…</span>
  </span>
);

export default Spinner;
