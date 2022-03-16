import dayjs from 'dayjs';

export const formatPrice = (amount, currency = 'EUR') => {
  if (amount == null || Number.isNaN(Number(amount))) return '—';
  try {
    return new Intl.NumberFormat('en-IE', {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(Number(amount));
  } catch {
    return `${currency} ${Number(amount).toFixed(2)}`;
  }
};

export const formatTime = (iso) => (iso ? dayjs(iso).format('HH:mm') : '--:--');

export const formatDate = (iso, withYear = false) =>
  iso ? dayjs(iso).format(withYear ? 'ddd, D MMM YYYY' : 'ddd, D MMM') : '';

export const formatDateInput = (iso) => (iso ? dayjs(iso).format('YYYY-MM-DD') : '');

/** "PT2H30M" -> "2h 30m", "PT55M" -> "55m". */
export const formatDuration = (isoDuration) => {
  if (!isoDuration) return '';
  const match = /PT(?:(\d+)H)?(?:(\d+)M)?/.exec(isoDuration);
  if (!match) return '';
  const [, h, m] = match;
  const hours = h ? `${h}h` : '';
  const mins = m ? `${m}m` : '';
  return [hours, mins].filter(Boolean).join(' ') || '0m';
};

/** Total journey time across the first→last segment of an itinerary. */
export const journeyDuration = (segments = []) => {
  if (!segments.length) return '';
  const start = dayjs(segments[0].departureAt);
  const end = dayjs(segments[segments.length - 1].arrivalAt);
  const totalMin = end.diff(start, 'minute');
  if (totalMin <= 0) return '';
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return `${h}h${m ? ` ${m}m` : ''}`;
};

export const stopsLabel = (stops) => {
  if (stops === 0) return 'Direct';
  return `${stops} stop${stops > 1 ? 's' : ''}`;
};

export const classLabel = (code) =>
  ({
    ECONOMY: 'Economy',
    PREMIUM_ECONOMY: 'Premium Economy',
    BUSINESS: 'Business',
    FIRST: 'First',
  }[code] || 'Economy');
