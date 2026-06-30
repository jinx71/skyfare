import React, { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Badge from '../components/Badge';
import PassengerFields from '../components/PassengerFields';
import { useSearchContext } from '../context/SearchContext';
import { createBooking } from '../api/bookings';
import {
  formatPrice,
  formatTime,
  formatDate,
  classLabel,
  stopsLabel,
} from '../utils/format';

const seedPassengers = (counts) => {
  const make = (type) => ({
    type,
    title: 'Mr',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
  });
  return [
    ...Array(counts.adults).fill(0).map(() => make('Adult')),
    ...Array(counts.children).fill(0).map(() => make('Child')),
    ...Array(counts.infants).fill(0).map(() => make('Infant')),
  ];
};

const LegSummary = ({ label, segments }) => {
  if (!segments?.length) return null;
  const first = segments[0];
  const last = segments[segments.length - 1];
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-slate-400">{label}</span>
      <span className="font-medium text-slate-700">
        {first.from} {formatTime(first.departureAt)} → {last.to} {formatTime(last.arrivalAt)}
      </span>
    </div>
  );
};

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { selectedOffer, searchMeta, setLastBooking } = useSearchContext();
  const [submitting, setSubmitting] = useState(false);

  // Guard: a flight must have been selected to reach checkout.
  useEffect(() => {
    if (!selectedOffer) {
      toast.info('Pick a flight to continue to checkout.');
      navigate('/', { replace: true });
    }
  }, [selectedOffer, navigate]);

  const counts = searchMeta?.counts || { adults: 1, children: 0, infants: 0 };

  const defaultPassengers = useMemo(() => seedPassengers(counts), [counts]);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: 'onBlur',
    defaultValues: {
      passengers: defaultPassengers,
      contact: { email: '', phone: '' },
      payment: { cardholder: '', cardNumber: '', expiry: '', cvc: '' },
    },
  });

  if (!selectedOffer) return null;

  const tripType =
    searchMeta?.tripType || (selectedOffer.returnSegments?.length ? 'round-trip' : 'one-way');

  const onSubmit = async (values) => {
    setSubmitting(true);
    try {
      const payload = {
        tripType,
        flight: selectedOffer,
        // strip the UI-only `type` field before sending
        passengers: values.passengers.map(({ type, ...rest }) => rest),
        contact: values.contact,
        payment: {
          cardholder: values.payment.cardholder,
          last4: values.payment.cardNumber.replace(/\D/g, '').slice(-4),
        },
      };
      const booking = await createBooking(payload);
      setLastBooking(booking);
      toast.success(`Booking ${booking.reference} confirmed!`);
      navigate('/confirmation', { replace: true });
    } catch (err) {
      const detail = err.fieldErrors?.[0]?.msg || err.message;
      toast.error(detail || 'Booking failed — please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-sm font-medium text-sky-600 hover:text-sky-700"
        >
          ← Back to results
        </button>
        <h1 className="mt-2 font-display text-2xl font-extrabold text-slate-900">
          Passenger & payment details
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left: forms */}
          <div className="space-y-6 lg:col-span-2">
            <Card className="p-5 sm:p-6">
              <h2 className="mb-4 text-base font-bold text-slate-900">
                Travellers ({defaultPassengers.length})
              </h2>
              <PassengerFields control={control} register={register} errors={errors} />
            </Card>

            <Card className="p-5 sm:p-6">
              <h2 className="mb-4 text-base font-bold text-slate-900">Contact details</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  type="email"
                  label="Email"
                  required
                  placeholder="you@example.com"
                  hint="Your confirmation is sent here"
                  error={errors.contact?.email?.message}
                  {...register('contact.email', {
                    required: 'Email is required',
                    pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' },
                  })}
                />
                <Input
                  type="tel"
                  label="Phone"
                  required
                  placeholder="+353 ..."
                  error={errors.contact?.phone?.message}
                  {...register('contact.phone', {
                    required: 'Phone is required',
                    minLength: { value: 6, message: 'Enter a valid phone number' },
                  })}
                />
              </div>
            </Card>

            <Card className="p-5 sm:p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900">Payment</h2>
                <Badge tone="amber">Demo · no card is charged</Badge>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Cardholder name"
                  required
                  containerClassName="sm:col-span-2"
                  placeholder="Name on card"
                  error={errors.payment?.cardholder?.message}
                  {...register('payment.cardholder', { required: 'Cardholder name is required' })}
                />
                <Input
                  label="Card number"
                  required
                  inputMode="numeric"
                  containerClassName="sm:col-span-2"
                  placeholder="4242 4242 4242 4242"
                  error={errors.payment?.cardNumber?.message}
                  {...register('payment.cardNumber', {
                    required: 'Card number is required',
                    validate: (v) =>
                      v.replace(/\D/g, '').length === 16 || 'Enter the 16-digit card number',
                  })}
                />
                <Input
                  label="Expiry (MM/YY)"
                  required
                  placeholder="08/27"
                  error={errors.payment?.expiry?.message}
                  {...register('payment.expiry', {
                    required: 'Expiry is required',
                    pattern: {
                      value: /^(0[1-9]|1[0-2])\/\d{2}$/,
                      message: 'Use MM/YY',
                    },
                  })}
                />
                <Input
                  label="CVC"
                  required
                  inputMode="numeric"
                  placeholder="123"
                  error={errors.payment?.cvc?.message}
                  {...register('payment.cvc', {
                    required: 'CVC is required',
                    pattern: { value: /^\d{3,4}$/, message: '3–4 digits' },
                  })}
                />
              </div>
            </Card>
          </div>

          {/* Right: order summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-20 p-5 sm:p-6">
              <h2 className="mb-1 text-base font-bold text-slate-900">Your trip</h2>
              <p className="mb-4 text-sm text-slate-500">
                {selectedOffer.carrierName} · {classLabel(selectedOffer.travelClass)}
              </p>

              <div className="space-y-2 border-y border-slate-100 py-4">
                <LegSummary label="Outbound" segments={selectedOffer.outboundSegments} />
                <div className="text-xs text-slate-400">
                  {formatDate(selectedOffer.outboundSegments?.[0]?.departureAt)} ·{' '}
                  {stopsLabel(selectedOffer.stops)}
                </div>
                {selectedOffer.returnSegments?.length > 0 && (
                  <>
                    <LegSummary label="Return" segments={selectedOffer.returnSegments} />
                    <div className="text-xs text-slate-400">
                      {formatDate(selectedOffer.returnSegments?.[0]?.departureAt)}
                    </div>
                  </>
                )}
              </div>

              <div className="flex items-center justify-between py-4">
                <span className="text-sm text-slate-500">
                  Total ({defaultPassengers.length} pax)
                </span>
                <span className="text-2xl font-extrabold text-slate-900">
                  {formatPrice(selectedOffer.price, selectedOffer.currency)}
                </span>
              </div>

              <Button type="submit" size="lg" loading={submitting} className="w-full">
                {submitting ? 'Confirming…' : 'Confirm booking'}
              </Button>
              <p className="mt-3 text-center text-xs text-slate-400">
                By confirming you agree this is a demo booking with no real payment.
              </p>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CheckoutPage;
