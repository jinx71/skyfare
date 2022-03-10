import React from 'react';

const Card = ({ children, className = '', as: Tag = 'div', ...props }) => (
  <Tag
    className={['rounded-2xl bg-white shadow-card border border-slate-100', className].join(' ')}
    {...props}
  >
    {children}
  </Tag>
);

export default Card;
