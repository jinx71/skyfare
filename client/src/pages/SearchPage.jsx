import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

import Card from '../components/Card';
import Button from '../components/Button';
import Select from '../components/Select';
import Input from '../components/Input';
import AirportAutocomplete from '../components/AirportAutocomplete';
import { useSearchContext } from '../context/SearchContext';

const addDays = (n) => dayjs().add(n, 'day').format('YYYY-MM-DD');
const labelFor = (a) => (a ? `${a.city} (${a.code})` : '');

const DEFAULT_ORIGIN = { code: 'DUB', city: 'Dublin', country: 'Ireland', name: 'Dublin Airport' };
const DEFAULT_DEST = {
  code: 'JFK',
  city: 'New York',
  country: 'United States',
  name: 'John F. Kennedy Intl',
};

const SearchPage = () => {
  const navigate = useNavigate();
  const { setSearchMeta } = useSearchContext();

  // Keep the chosen airport objects so the swap button can relabel the inputs.
  const [originAirport, setOriginAirport] = useState(DEFAULT_ORIGIN);
  const [destAirport, setDestAirport] = useState(DEFAULT_DEST);
  const [swapKey, setSwapKey] = useState(0);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm({
    mode: 'onBlur',
    defaultValues: {
      tripType: 'round-trip',
      origin: DEFAULT_ORIGIN.code,
      destination: DEFAULT_DEST.code,
      departureDate: addDays(14),
      returnDate: addDays(21),
      adults: '1',
      children: '0',
      infants: '0',
      travelClass: 'ECONOMY',
      nonStop: false,
    },
  });

  const tripType = watch('tripType');
  const departureDate = watch('departureDate');
  const isRoundTrip = tripType === 'round-trip';

  const swap = () => {
    const o = getValues('origin');
    const d = getValues('destination');
    setValue('origin', d, { shouldValidate: true });
    setValue('destination', o, { shouldValidate: true });
    setOriginAirport(destAirport);
    setDestAirport(originAirport);
    setSwapKey((k) => k + 1);
  };

  const onSubmit = (values) => {
    const total =
      Number(values.adults) + Number(values.children) + Number(values.infants);

    const params = new URLSearchParams({
      origin: values.origin,
      destination: values.destination,
      departureDate: values.departureDate,
      adults: values.adults,
      children: values.children,
      infants: values.infants,
      travelClass: values.travelClass,
      nonStop: values.nonStop ? 'true' : 'false',
    });
    if (isRoundTrip && values.returnDate) params.set('returnDate', values.returnDate);

    setSearchMeta({
      tripType: values.tripType,
      counts: {
        adults: Number(values.adults),
        children: Number(values.children),
        infants: Number(values.infants),
      },
      total,
    });

    navigate(`/results?${params.toString()}`);
  };

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-sky-600 via-sky-500 to-sky-700">
        <div className="absolute inset-0 opacity-20" aria-hidden="true">
          <div className="absolute -left-10 top-10 h-40 w-40 rounded-full bg-white blur-3xl" />
          <div className="absolute right-0 top-0 h-56 w-56 rounded-full bg-sky-300 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-6xl px-4 pb-28 pt-14 text-center sm:px-6 sm:pt-20">
          <h1 className="font-display text-3xl font-extrabold text-white sm:text-5xl">
            Find your next flight
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sky-50/90">
            Search live fares across hundreds of airlines, then book in a couple of taps.
          </p>
        </div>
      </section>

      {/* Search form overlapping the hero */}
      <section className="mx-auto -mt-20 max-w-5xl px-4 sm:px-6">
        <Card className="p-5 sm:p-7">
          {/* Trip type segmented control */}
          <input type="hidden" {...register('tripType')} />
          <div
            role="radiogroup"
            aria-label="Trip type"
            className="mb-5 inline-flex rounded-xl bg-slate-100 p-1"
          >
            {[
              { key: 'round-trip', label: 'Round trip' },
              { key: 'one-way', label: 'One way' },
            ].map((opt) => (
              <button
                key={opt.key}
                type="button"
                role="radio"
                aria-checked={tripType === opt.key}
                onClick={() => setValue('tripType', opt.key)}
                className={[
                  'rounded-lg px-4 py-1.5 text-sm font-semibold transition-colors',
                  tripType === opt.key
                    ? 'bg-white text-sky-700 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700',
                ].join(' ')}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            {/* Route + dates */}
            <div className="grid gap-4 lg:grid-cols-12">
              <div className="relative lg:col-span-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Controller
                    name="origin"
                    control={control}
                    rules={{ required: 'Choose a departure airport' }}
                    render={({ field }) => (
                      <AirportAutocomplete
                        key={`origin-${swapKey}`}
                        label="From"
                        required
                        value={field.value}
                        initialLabel={labelFor(originAirport)}
                        onChange={field.onChange}
                        onSelectAirport={setOriginAirport}
                        error={errors.origin?.message}
                        placeholder="From where?"
                      />
                    )}
                  />
                  <Controller
                    name="destination"
                    control={control}
                    rules={{
                      required: 'Choose a destination airport',
                      validate: (v) =>
                        v !== getValues('origin') || 'Origin and destination must differ',
                    }}
                    render={({ field }) => (
                      <AirportAutocomplete
                        key={`dest-${swapKey}`}
                        label="To"
                        required
                        value={field.value}
                        initialLabel={labelFor(destAirport)}
                        onChange={field.onChange}
                        onSelectAirport={setDestAirport}
                        error={errors.destination?.message}
                        placeholder="Where to?"
                      />
                    )}
                  />
                </div>

                {/* Swap button (desktop) */}
                <button
                  type="button"
                  onClick={swap}
                  aria-label="Swap origin and destination"
                  className="absolute left-1/2 top-9 hidden h-9 w-9 -translate-x-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:text-sky-600 sm:flex"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                  </svg>
                </button>
              </div>

              <Input
                type="date"
                label="Departure"
                required
                containerClassName="lg:col-span-3"
                min={dayjs().format('YYYY-MM-DD')}
                error={errors.departureDate?.message}
                {...register('departureDate', {
                  required: 'Pick a departure date',
                  validate: (v) =>
                    dayjs(v).isAfter(dayjs().subtract(1, 'day')) || 'Date cannot be in the past',
                })}
              />

              <Input
                type="date"
                label="Return"
                containerClassName="lg:col-span-3"
                disabled={!isRoundTrip}
                min={departureDate}
                error={errors.returnDate?.message}
                {...register('returnDate', {
                  validate: (v) => {
                    if (!isRoundTrip) return true;
                    if (!v) return 'Pick a return date';
                    return (
                      !dayjs(v).isBefore(dayjs(departureDate)) ||
                      'Return must be on or after departure'
                    );
                  },
                })}
              />
            </div>

            {/* Passengers + class */}
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Select label="Adults" {...register('adults')}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                  <option key={n} value={n}>
                    {n} adult{n > 1 ? 's' : ''}
                  </option>
                ))}
              </Select>
              <Select label="Children" hint="2–11 yrs" {...register('children')}>
                {[0, 1, 2, 3, 4, 5, 6].map((n) => (
                  <option key={n} value={n}>
                    {n} child{n === 1 ? '' : 'ren'}
                  </option>
                ))}
              </Select>
              <Select label="Infants" {...register('infants')}>
                {[0, 1, 2, 3, 4].map((n) => (
                  <option key={n} value={n}>
                    {n} infant{n === 1 ? '' : 's'}
                  </option>
                ))}
              </Select>
              <Select label="Cabin class" {...register('travelClass')}>
                <option value="ECONOMY">Economy</option>
                <option value="PREMIUM_ECONOMY">Premium Economy</option>
                <option value="BUSINESS">Business</option>
                <option value="FIRST">First</option>
              </Select>
            </div>

            <div className="mt-5 flex flex-col items-stretch justify-between gap-4 sm:flex-row sm:items-center">
              <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  {...register('nonStop')}
                  className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                />
                Direct flights only
              </label>

              <Button type="submit" size="lg" className="sm:px-10">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.3-4.3M11 18a7 7 0 100-14 7 7 0 000 14z" />
                </svg>
                Search flights
              </Button>
            </div>
          </form>
        </Card>

        <p className="mt-4 text-center text-xs text-slate-400">
          Tip: try Dublin → New York. With no Amadeus keys set, SkyFare returns clearly-labelled
          sample flights so you can explore the whole flow.
        </p>
      </section>
    </div>
  );
};

export default SearchPage;
