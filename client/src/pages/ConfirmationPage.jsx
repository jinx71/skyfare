import React from 'react';
import { Link } from 'react-router-dom';

import Card from '../components/Card';
import Button from '../components/Button';
import Badge from '../components/Badge';
import EmptyState from '../components/EmptyState';
import { useSearchContext } from '../context/SearchContext';
import {
  formatPrice,
  formatTime,
  formatDate,
  classLabel,
  stopsLabel,
} from '../utils/format';

const Leg = ({ label, segments }) => {
  if (!segments?.length) return null;
  const first = segments[0];
  const last = segments[segments.length - 1];
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</span>
        <span className="text-xs text-slate-400">{formatDate(first.departureAt, true)}</span>
      </div>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-lg font-bold text-slate-900">{formatTime(first.departureAt)}</div>
          <div className="text-xs text-slate-500">{first.from}</div>
        </div>
        <div className="px-3 text-center text-xs text-slate-400">{stopsLabel(segments.length - 1)}</div>
        <div className="text-right">
          <div className="text-lg font-bold text-slate-900">{formatTime(last.arrivalAt)}</div>
          <div className="text-xs text-slate-500">{last.to}</div>
        </div>
      </div>
    </div>
  );
};

const ConfirmationPage = () => {
  const { lastBooking } = useSearchContext();

  if (!lastBooking) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 sm:px-6">
        <EmptyState
          title="No recent booking to show"
          message="Your confirmation isn’t in this session anymore. You can look it up under My trips."
          action={
            <Link to="/bookings">
              <Button>Go to My trips</Button>
            </Link>
          }
        />
      </div>
    );
  }

  const b = lastBooking;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      {/* Success header */}
      <div className="mb-6 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="font-display text-2xl font-extrabold text-slate-900">You’re booked!</h1>
        <p className="mt-1 text-sm text-slate-500">
          A confirmation has been sent to {b.contact?.email}.
        </p>
      </div>

      <Card className="overflow-hidden">
        {/* Reference banner */}
        <div className="flex items-center justify-between bg-sky-600 px-5 py-4 text-white">
          <span className="text-sm text-sky-100">Booking reference</span>
          <span className="font-mono text-xl font-bold tracking-widest">{b.reference}</span>
        </div>

        <div className="space-y-4 p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="sky">{b.flight?.carrier}</Badge>
            <Badge tone="slate">{classLabel(b.travelClass)}</Badge>
            <Badge tone="green">{b.status}</Badge>
            <Badge tone="slate">{b.tripType}</Badge>
          </div>

          <Leg label="Outbound" segments={b.flight?.outboundSegments} />
          {b.flight?.returnSegments?.length > 0 && (
            <Leg label="Return" segments={b.flight?.returnSegments} />
          )}

          {/* Passengers */}
          <div>
            <h3 className="mb-2 text-sm font-semibold text-slate-700">
              Passengers ({b.passengers?.length})
            </h3>
            <ul className="divide-y divide-slate-100 rounded-xl border border-slate-100">
              {b.passengers?.map((p, i) => (
                <li key={i} className="flex items-center justify-between px-4 py-2.5 text-sm">
                  <span className="font-medium text-slate-700">
                    {p.title} {p.firstName} {p.lastName}
                  </span>
                  <span className="text-xs capitalize text-slate-400">{p.gender}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Total */}
          <div className="flex items-center justify-between border-t border-slate-100 pt-4">
            <span className="text-sm text-slate-500">Total paid</span>
            <span className="text-2xl font-extrabold text-slate-900">
              {formatPrice(b.flight?.price, b.flight?.currency)}
            </span>
          </div>
        </div>
      </Card>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link to="/bookings">
          <Button variant="secondary" className="w-full sm:w-auto">
            View all trips
          </Button>
        </Link>
        <Link to="/">
          <Button className="w-full sm:w-auto">Book another flight</Button>
        </Link>
      </div>
    </div>
  );
};

export default ConfirmationPage;
