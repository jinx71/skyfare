import React from 'react';
import Card from './Card';

/** Loading placeholder shaped like a FlightCard. */
const SkeletonCard = () => (
  <Card className="p-5">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex-1 space-y-3">
        <div className="skeleton h-4 w-28" />
        <div className="flex items-center gap-4">
          <div className="skeleton h-8 w-16" />
          <div className="skeleton h-3 flex-1 max-w-[140px]" />
          <div className="skeleton h-8 w-16" />
        </div>
        <div className="skeleton h-3 w-40" />
      </div>
      <div className="flex flex-col items-end gap-2">
        <div className="skeleton h-7 w-24" />
        <div className="skeleton h-9 w-28 rounded-xl" />
      </div>
    </div>
  </Card>
);

export const SkeletonList = ({ count = 4 }) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);

export default SkeletonCard;
