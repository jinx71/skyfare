import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import dayjs from 'dayjs';

import { searchFlights } from '../api/flights';
import { useSearchContext } from '../context/SearchContext';
import FlightCard from '../components/FlightCard';
import { SkeletonList } from '../components/SkeletonCard';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import Button from '../components/Button';
import { formatDate, classLabel } from '../utils/format';

const outboundMinutes = (offer) => {
  const segs = offer.outboundSegments || [];
  if (!segs.length) return Infinity;
  return dayjs(segs[segs.length - 1].arrivalAt).diff(dayjs(segs[0].departureAt), 'minute');
};

const SORTS = {
  cheapest: { label: 'Cheapest', fn: (a, b) => a.price - b.price },
  fastest: { label: 'Fastest', fn: (a, b) => outboundMinutes(a) - outboundMinutes(b) },
  stops: { label: 'Fewest stops', fn: (a, b) => (a.stops ?? 0) - (b.stops ?? 0) || a.price - b.price },
};

const ResultsPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setSelectedOffer, setSearchMeta } = useSearchContext();

  const [status, setStatus] = useState('loading'); // loading | success | error
  const [offers, setOffers] = useState([]);
  const [isMock, setIsMock] = useState(false);
  const [error, setError] = useState('');
  const [sortKey, setSortKey] = useState('cheapest');
  const [reloadToken, setReloadToken] = useState(0);

  const query = useMemo(() => Object.fromEntries(searchParams.entries()), [searchParams]);
  const passengerCount =
    Number(query.adults || 1) + Number(query.children || 0) + Number(query.infants || 0);

  // Keep checkout-relevant context in sync with the URL (survives refresh).
  useEffect(() => {
    setSearchMeta({
      tripType: query.returnDate ? 'round-trip' : 'one-way',
      counts: {
        adults: Number(query.adults || 1),
        children: Number(query.children || 0),
        infants: Number(query.infants || 0),
      },
      total: passengerCount,
    });
  }, [query.adults, query.children, query.infants, query.returnDate, passengerCount, setSearchMeta]);

  useEffect(() => {
    const controller = new AbortController();
    setStatus('loading');
    setError('');

    searchFlights(query, controller.signal)
      .then((data) => {
        setOffers(data.offers || []);
        setIsMock(Boolean(data.mock));
        setStatus('success');
      })
      .catch((err) => {
        if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') return;
        setError(err.message || 'We couldn’t load flights for this search.');
        setStatus('error');
      });

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, reloadToken]);

  const sortedOffers = useMemo(
    () => [...offers].sort(SORTS[sortKey].fn),
    [offers, sortKey]
  );

  const handleSelect = (offer) => {
    setSelectedOffer(offer);
    navigate('/checkout');
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      {/* Search summary bar */}
      <div className="mb-6 flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-card sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <span>{query.origin}</span>
            <svg className="h-4 w-4 text-sky-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
            </svg>
            <span>{query.destination}</span>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-500">
            <span>{formatDate(query.departureDate, true)}</span>
            {query.returnDate && (
              <>
                <span aria-hidden="true">·</span>
                <span>{formatDate(query.returnDate, true)}</span>
              </>
            )}
            <span aria-hidden="true">·</span>
            <span>
              {passengerCount} passenger{passengerCount > 1 ? 's' : ''}
            </span>
            <span aria-hidden="true">·</span>
            <span>{classLabel(query.travelClass)}</span>
          </div>
        </div>
        <Link to="/">
          <Button variant="secondary">Edit search</Button>
        </Link>
      </div>

      {isMock && status === 'success' && (
        <div className="mb-5 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <svg className="mt-0.5 h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M12 3l9 16H3l9-16z" />
          </svg>
          <span>
            <strong>Sample data.</strong> No Amadeus API keys are configured, so these flights are
            generated for demo purposes. Add credentials in <code>server/.env</code> for live fares.
          </span>
        </div>
      )}

      {/* Header row with count + sort */}
      {status === 'success' && offers.length > 0 && (
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-medium text-slate-600">
            {sortedOffers.length} flight{sortedOffers.length > 1 ? 's' : ''} found
          </p>
          <div className="flex items-center gap-1.5">
            <span className="hidden text-xs text-slate-400 sm:inline">Sort by</span>
            {Object.entries(SORTS).map(([key, { label }]) => (
              <button
                key={key}
                onClick={() => setSortKey(key)}
                aria-pressed={sortKey === key}
                className={[
                  'rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors',
                  sortKey === key
                    ? 'bg-sky-100 text-sky-700'
                    : 'text-slate-500 hover:bg-slate-100',
                ].join(' ')}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* States */}
      {status === 'loading' && <SkeletonList count={5} />}

      {status === 'error' && (
        <ErrorState
          title="Couldn’t load flights"
          message={error}
          onRetry={() => setReloadToken((t) => t + 1)}
        />
      )}

      {status === 'success' && offers.length === 0 && (
        <EmptyState
          title="No flights for this route"
          message="Try different dates, remove the direct-only filter, or search another destination."
          action={
            <Link to="/">
              <Button>Change search</Button>
            </Link>
          }
          icon={
            <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.6 9h16.8M3.6 15h16.8M11 3a17 17 0 000 18M13 3a17 17 0 010 18" />
            </svg>
          }
        />
      )}

      {status === 'success' && sortedOffers.length > 0 && (
        <div className="space-y-4">
          {sortedOffers.map((offer) => (
            <FlightCard key={offer.id} offer={offer} onSelect={handleSelect} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ResultsPage;
