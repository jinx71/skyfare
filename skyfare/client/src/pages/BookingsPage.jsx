import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Badge from '../components/Badge';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import { SkeletonList } from '../components/SkeletonCard';
import { listBookings } from '../api/bookings';
import { formatPrice, formatDate } from '../utils/format';

const BookingRow = ({ booking }) => {
  const out = booking.flight?.outboundSegments || [];
  const ret = booking.flight?.returnSegments || [];
  return (
    <Card className="animate-fade-up p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold tracking-wider text-sky-700">
              {booking.reference}
            </span>
            <Badge tone={booking.status === 'confirmed' ? 'green' : 'rose'}>{booking.status}</Badge>
            <Badge tone="slate">{booking.tripType}</Badge>
          </div>
          <div className="mt-1.5 flex items-center gap-2 text-lg font-bold text-slate-900">
            <span>{booking.origin}</span>
            <svg className="h-4 w-4 text-sky-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
            </svg>
            <span>{booking.destination}</span>
          </div>
          <div className="mt-1 text-sm text-slate-500">
            {formatDate(booking.departureDate, true)}
            {ret.length > 0 && booking.returnDate && <> · {formatDate(booking.returnDate, true)}</>}
            {' · '}
            {booking.passengers?.length} passenger{booking.passengers?.length > 1 ? 's' : ''}
            {' · '}
            {booking.flight?.carrier}
          </div>
        </div>
        <div className="text-right">
          <div className="text-xl font-extrabold text-slate-900">
            {formatPrice(booking.flight?.price, booking.flight?.currency)}
          </div>
          <div className="text-xs text-slate-400">{out.length ? `${out.length} segment(s)` : ''}</div>
        </div>
      </div>
    </Card>
  );
};

const BookingsPage = () => {
  const [status, setStatus] = useState('loading');
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let active = true;
    setStatus('loading');
    setError('');

    listBookings(email.trim() || undefined)
      .then((data) => {
        if (!active) return;
        setBookings(Array.isArray(data) ? data : []);
        setStatus('success');
      })
      .catch((err) => {
        if (!active) return;
        setError(err.message || 'Couldn’t load your bookings.');
        setStatus('error');
      });

    return () => {
      active = false;
    };
  }, [reloadToken]); // eslint-disable-line react-hooks/exhaustive-deps

  const applyFilter = (e) => {
    e.preventDefault();
    setReloadToken((t) => t + 1);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-slate-900">My trips</h1>
          <p className="mt-1 text-sm text-slate-500">Every booking you’ve made with SkyFare.</p>
        </div>
        <form onSubmit={applyFilter} className="flex items-end gap-2">
          <Input
            label="Filter by email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            containerClassName="w-56"
          />
          <Button type="submit" variant="secondary">
            Apply
          </Button>
        </form>
      </div>

      {status === 'loading' && <SkeletonList count={3} />}

      {status === 'error' && (
        <ErrorState
          title="Couldn’t load bookings"
          message={`${error} If you just started the server, make sure MongoDB is connected.`}
          onRetry={() => setReloadToken((t) => t + 1)}
        />
      )}

      {status === 'success' && bookings.length === 0 && (
        <EmptyState
          title={email ? 'No trips for that email' : 'No trips yet'}
          message={
            email
              ? 'Try a different email, or clear the filter to see all bookings.'
              : 'Search for a flight and complete a booking — it’ll show up here.'
          }
          action={
            <Link to="/">
              <Button>Search flights</Button>
            </Link>
          }
          icon={
            <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h18M3 12h18M3 17h18" />
            </svg>
          }
        />
      )}

      {status === 'success' && bookings.length > 0 && (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <BookingRow key={booking._id || booking.reference} booking={booking} />
          ))}
        </div>
      )}
    </div>
  );
};

export default BookingsPage;
