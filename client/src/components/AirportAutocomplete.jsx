import React, { useEffect, useRef, useState } from 'react';
import { searchAirports } from '../api/airports';
import useDebounce from '../hooks/useDebounce';
import { useUniqueId } from '../hooks/useUniqueId';
import Spinner from './Spinner';

const labelFor = (a) => `${a.city} (${a.code})`;

/**
 * Async airport/city picker.
 *
 * Controlled by `value` (an IATA code) + `onChange(code)` so it plugs straight
 * into react-hook-form via <Controller>. It keeps its own input text + dropdown
 * state, debounces keystrokes, cancels stale requests, and reports the chosen
 * airport object through `onSelectAirport` (used for nice labels elsewhere).
 */
const AirportAutocomplete = ({
  label,
  value,
  onChange,
  onSelectAirport,
  error,
  placeholder = 'City or airport',
  required,
  initialLabel = '',
}) => {
  const reactId = useUniqueId('airport');
  const listId = `${reactId}-list`;

  const [query, setQuery] = useState(initialLabel);
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [selectedLabel, setSelectedLabel] = useState(initialLabel);

  const containerRef = useRef(null);
  const debouncedQuery = useDebounce(query.trim(), 300);

  // Fetch suggestions, skipping when the box already shows a chosen airport.
  useEffect(() => {
    if (!open) return undefined;
    if (debouncedQuery.length < 2 || debouncedQuery === selectedLabel) {
      setResults([]);
      return undefined;
    }

    const controller = new AbortController();
    setLoading(true);

    searchAirports(debouncedQuery, controller.signal)
      .then((data) => {
        setResults(data.airports || []);
        setActiveIndex(-1);
      })
      .catch((err) => {
        if (err.name !== 'CanceledError' && err.code !== 'ERR_CANCELED') {
          setResults([]);
        }
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [debouncedQuery, open, selectedLabel]);

  // Close on outside click.
  useEffect(() => {
    const onClickAway = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickAway);
    return () => document.removeEventListener('mousedown', onClickAway);
  }, []);

  const choose = (airport) => {
    const text = labelFor(airport);
    setQuery(text);
    setSelectedLabel(text);
    setResults([]);
    setOpen(false);
    setActiveIndex(-1);
    onChange?.(airport.code);
    onSelectAirport?.(airport);
  };

  const handleInput = (e) => {
    const next = e.target.value;
    setQuery(next);
    setOpen(true);
    if (next !== selectedLabel) {
      setSelectedLabel('');
      onChange?.('');
    }
  };

  const handleKeyDown = (e) => {
    if (!open && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      setOpen(true);
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      if (open && activeIndex >= 0 && results[activeIndex]) {
        e.preventDefault();
        choose(results[activeIndex]);
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  const showDropdown = open && (loading || results.length > 0 || debouncedQuery.length >= 2);

  return (
    <div className="relative" ref={containerRef}>
      {label && (
        <label className="mb-1 block text-sm font-medium text-slate-700">
          {label}
          {required && <span className="ml-0.5 text-rose-500">*</span>}
        </label>
      )}

      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s-7-5.6-7-11a7 7 0 1114 0c0 5.4-7 11-7 11z" />
            <circle cx="12" cy="10" r="2.4" />
          </svg>
        </span>
        <input
          type="text"
          role="combobox"
          aria-expanded={showDropdown}
          aria-controls={listId}
          aria-autocomplete="list"
          autoComplete="off"
          value={query}
          onChange={handleInput}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          aria-invalid={Boolean(error)}
          className={[
            'w-full rounded-xl border bg-white py-2.5 pl-9 pr-9 text-sm text-slate-900',
            'placeholder:text-slate-400 transition-colors focus:outline-none focus:ring-2',
            error
              ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-200'
              : 'border-slate-200 focus:border-sky-400 focus:ring-sky-200',
          ].join(' ')}
        />
        {loading && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2">
            <Spinner size="sm" />
          </span>
        )}
      </div>

      {error && <p className="mt-1 text-xs font-medium text-rose-600">{error}</p>}

      {showDropdown && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-20 mt-1.5 max-h-72 w-full overflow-auto rounded-xl border border-slate-100 bg-white py-1 shadow-lift"
        >
          {loading && results.length === 0 && (
            <li className="px-3 py-3 text-sm text-slate-400">Searching airports…</li>
          )}
          {!loading && results.length === 0 && (
            <li className="px-3 py-3 text-sm text-slate-400">
              No airports match “{debouncedQuery}”.
            </li>
          )}
          {results.map((airport, idx) => (
            <li
              key={`${airport.code}-${idx}`}
              role="option"
              aria-selected={idx === activeIndex}
              onMouseDown={(e) => {
                e.preventDefault();
                choose(airport);
              }}
              onMouseEnter={() => setActiveIndex(idx)}
              className={[
                'flex cursor-pointer items-center justify-between gap-3 px-3 py-2.5',
                idx === activeIndex ? 'bg-sky-50' : 'hover:bg-slate-50',
              ].join(' ')}
            >
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-slate-800">
                  {airport.city}
                  <span className="ml-1 font-normal text-slate-400">{airport.country}</span>
                </span>
                <span className="block truncate text-xs text-slate-400">{airport.name}</span>
              </span>
              <span className="shrink-0 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-bold tracking-wide text-slate-600">
                {airport.code}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AirportAutocomplete;
