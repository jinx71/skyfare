import React from 'react';
import Card from './Card';
import Badge from './Badge';
import Button from './Button';
import {
  formatTime,
  formatDate,
  journeyDuration,
  stopsLabel,
  formatPrice,
  classLabel,
} from '../utils/format';

const Leg = ({ label, segments }) => {
  if (!segments || segments.length === 0) return null;
  const first = segments[0];
  const last = segments[segments.length - 1];
  const stops = segments.length - 1;

  return (
    <div className="flex-1">
      <div className="mb-1 flex items-center gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          {label}
        </span>
        <span className="text-xs text-slate-400">{formatDate(first.departureAt)}</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <div className="text-xl font-bold leading-none text-slate-900">
            {formatTime(first.departureAt)}
          </div>
          <div className="mt-0.5 text-xs font-medium text-slate-500">{first.from}</div>
        </div>

        <div className="flex flex-1 flex-col items-center px-1">
          <span className="text-[11px] text-slate-400">{journeyDuration(segments)}</span>
          <div className="my-1 flex w-full items-center">
            <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
            <span className="h-px flex-1 bg-slate-200" />
            <svg className="h-3.5 w-3.5 text-sky-400" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21 16v-2l-8-5V3.5A1.5 1.5 0 0 0 11.5 2 1.5 1.5 0 0 0 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z" />
            </svg>
            <span className="h-px flex-1 bg-slate-200" />
            <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
          </div>
          <span className="text-[11px] font-medium text-slate-400">{stopsLabel(stops)}</span>
        </div>

        <div className="text-left">
          <div className="text-xl font-bold leading-none text-slate-900">
            {formatTime(last.arrivalAt)}
          </div>
          <div className="mt-0.5 text-xs font-medium text-slate-500">{last.to}</div>
        </div>
      </div>
    </div>
  );
};

const FlightCard = ({ offer, onSelect }) => {
  const isDirect = (offer.stops ?? 0) === 0;
  const lowSeats = typeof offer.seatsLeft === 'number' && offer.seatsLeft <= 4;

  return (
    <Card className="animate-fade-up p-5 transition-shadow hover:shadow-lift">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center">
        <div className="flex-1">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-100 text-xs font-bold text-sky-700">
              {String(offer.carrier || '??').slice(0, 2)}
            </span>
            <span className="text-sm font-semibold text-slate-700">{offer.carrierName}</span>
            <Badge tone="slate">{classLabel(offer.travelClass)}</Badge>
            {isDirect && <Badge tone="green">Direct</Badge>}
            {lowSeats && <Badge tone="amber">{offer.seatsLeft} seats left</Badge>}
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:gap-8">
            <Leg label="Outbound" segments={offer.outboundSegments} />
            {offer.returnSegments?.length > 0 && (
              <>
                <span className="hidden w-px self-stretch bg-slate-100 sm:block" />
                <Leg label="Return" segments={offer.returnSegments} />
              </>
            )}
          </div>
        </div>

        <div className="flex items-end justify-between gap-4 border-t border-slate-100 pt-4 lg:w-48 lg:flex-col lg:items-end lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
          <div className="text-right">
            <div className="text-2xl font-extrabold text-slate-900">
              {formatPrice(offer.price, offer.currency)}
            </div>
            <div className="text-xs text-slate-400">total price</div>
          </div>
          <Button onClick={() => onSelect(offer)} className="whitespace-nowrap">
            Select
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default FlightCard;
