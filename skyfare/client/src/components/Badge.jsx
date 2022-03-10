import React from 'react';

const TONES = {
  sky: 'bg-sky-100 text-sky-700',
  green: 'bg-emerald-100 text-emerald-700',
  amber: 'bg-amber-100 text-amber-700',
  rose: 'bg-rose-100 text-rose-700',
  slate: 'bg-slate-100 text-slate-600',
  violet: 'bg-violet-100 text-violet-700',
};

const Badge = ({ children, tone = 'slate', className = '' }) => (
  <span
    className={[
      'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold',
      TONES[tone] || TONES.slate,
      className,
    ].join(' ')}
  >
    {children}
  </span>
);

export default Badge;
