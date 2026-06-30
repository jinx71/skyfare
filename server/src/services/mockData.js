/**
 * MOCK FALLBACK DATA
 * ------------------
 * Used ONLY when AMADEUS_CLIENT_ID / AMADEUS_CLIENT_SECRET are not set, so the
 * portfolio app runs end-to-end without anyone having to register for Amadeus.
 * Every mock response is flagged with `mock: true` so the UI can show a banner.
 *
 * With real credentials in server/.env this file is never touched.
 */

const AIRPORTS = [
  { code: 'DUB', name: 'Dublin Airport', city: 'Dublin', country: 'Ireland' },
  { code: 'LHR', name: 'Heathrow Airport', city: 'London', country: 'United Kingdom' },
  { code: 'LGW', name: 'Gatwick Airport', city: 'London', country: 'United Kingdom' },
  { code: 'JFK', name: 'John F. Kennedy Intl', city: 'New York', country: 'United States' },
  { code: 'EWR', name: 'Newark Liberty Intl', city: 'New York', country: 'United States' },
  { code: 'CDG', name: 'Charles de Gaulle', city: 'Paris', country: 'France' },
  { code: 'AMS', name: 'Amsterdam Schiphol', city: 'Amsterdam', country: 'Netherlands' },
  { code: 'BCN', name: 'Barcelona–El Prat', city: 'Barcelona', country: 'Spain' },
  { code: 'MAD', name: 'Adolfo Suárez Madrid–Barajas', city: 'Madrid', country: 'Spain' },
  { code: 'FCO', name: 'Leonardo da Vinci–Fiumicino', city: 'Rome', country: 'Italy' },
  { code: 'BER', name: 'Berlin Brandenburg', city: 'Berlin', country: 'Germany' },
  { code: 'FRA', name: 'Frankfurt Airport', city: 'Frankfurt', country: 'Germany' },
  { code: 'LAX', name: 'Los Angeles Intl', city: 'Los Angeles', country: 'United States' },
  { code: 'SFO', name: 'San Francisco Intl', city: 'San Francisco', country: 'United States' },
  { code: 'DXB', name: 'Dubai Intl', city: 'Dubai', country: 'United Arab Emirates' },
  { code: 'SNN', name: 'Shannon Airport', city: 'Shannon', country: 'Ireland' },
  { code: 'ORK', name: 'Cork Airport', city: 'Cork', country: 'Ireland' },
];

const CARRIERS = {
  EI: 'Aer Lingus',
  BA: 'British Airways',
  FR: 'Ryanair',
  LH: 'Lufthansa',
  AF: 'Air France',
  KL: 'KLM',
};

const mockAirportSearch = (keyword = '') => {
  const q = keyword.trim().toLowerCase();
  const matches = AIRPORTS.filter(
    (a) =>
      a.code.toLowerCase().includes(q) ||
      a.city.toLowerCase().includes(q) ||
      a.name.toLowerCase().includes(q)
  ).slice(0, 8);
  return { mock: true, airports: matches };
};

const minutesToIso = (mins) => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `PT${h}H${m ? `${m}M` : ''}`;
};

const addMinutes = (iso, mins) => new Date(new Date(iso).getTime() + mins * 60000).toISOString();

const buildSegment = (from, to, departISO, durationMins, carrierCode, flightNumber) => ({
  from,
  to,
  departureAt: departISO,
  arrivalAt: addMinutes(departISO, durationMins),
  carrierCode,
  carrierName: CARRIERS[carrierCode] || carrierCode,
  flightNumber,
  duration: minutesToIso(durationMins),
});

const mockFlightSearch = (params) => {
  const {
    origin,
    destination,
    departureDate,
    returnDate,
    travelClass = 'ECONOMY',
    nonStop = false,
  } = params;

  const carriers = Object.keys(CARRIERS);
  const offers = [];

  for (let i = 0; i < 6; i += 1) {
    const carrierCode = carriers[i % carriers.length];
    const basePrice = 79 + i * 46 + (travelClass === 'BUSINESS' ? 540 : 0);
    const departISO = `${departureDate}T${String(6 + i * 2).padStart(2, '0')}:25:00`;
    const legMinutes = 95 + i * 18;
    const direct = nonStop || i % 2 === 0;

    const outbound = direct
      ? [buildSegment(origin, destination, departISO, legMinutes, carrierCode, `${100 + i}`)]
      : [
          buildSegment(origin, 'AMS', departISO, 70, carrierCode, `${200 + i}`),
          buildSegment(
            'AMS',
            destination,
            addMinutes(departISO, 70 + 55),
            legMinutes,
            carrierCode,
            `${300 + i}`
          ),
        ];

    let returnSegments = [];
    if (returnDate) {
      const retISO = `${returnDate}T${String(10 + i).padStart(2, '0')}:10:00`;
      returnSegments = direct
        ? [buildSegment(destination, origin, retISO, legMinutes, carrierCode, `${400 + i}`)]
        : [
            buildSegment(destination, 'AMS', retISO, legMinutes, carrierCode, `${500 + i}`),
            buildSegment(
              'AMS',
              origin,
              addMinutes(retISO, legMinutes + 50),
              70,
              carrierCode,
              `${600 + i}`
            ),
          ];
    }

    offers.push({
      id: `mock-${i + 1}`,
      mock: true,
      carrier: carrierCode,
      carrierName: CARRIERS[carrierCode],
      price: returnDate ? basePrice * 2 - 20 : basePrice,
      currency: 'EUR',
      travelClass,
      seatsLeft: 9 - i,
      stops: direct ? 0 : 1,
      outboundSegments: outbound,
      returnSegments,
    });
  }

  // cheapest first
  offers.sort((a, b) => a.price - b.price);
  return { mock: true, offers };
};

module.exports = { mockAirportSearch, mockFlightSearch, CARRIERS };
