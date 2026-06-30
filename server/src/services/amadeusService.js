const axios = require('axios');
const NodeCache = require('node-cache');

const { mockAirportSearch, mockFlightSearch } = require('./mockData');

/**
 * ============================================================================
 *  ENGINEERING LESSON (SkyFare): proxy a KEYED third-party API through Express.
 * ============================================================================
 *  - The Amadeus client_id/client_secret live ONLY here on the server.
 *  - The React client never sees them; it only calls our own /api routes.
 *  - Amadeus uses OAuth2 client-credentials: we exchange the secret for a
 *    short-lived access token, cache it until just before it expires, and
 *    reuse it across requests.
 *  - Search responses are cached with node-cache so we don't burn through the
 *    free-tier rate limit when users poll/retype (the cache absorbs the load).
 * ============================================================================
 */

const BASE_URL = process.env.AMADEUS_BASE_URL || 'https://test.api.amadeus.com';
const CLIENT_ID = process.env.AMADEUS_CLIENT_ID;
const CLIENT_SECRET = process.env.AMADEUS_CLIENT_SECRET;

const hasCredentials = () => Boolean(CLIENT_ID && CLIENT_SECRET);

// Cache for normalized search responses.
const responseCache = new NodeCache({ stdTTL: 60 * 10, checkperiod: 120 }); // 10 min default
const AIRPORT_TTL = 60 * 60 * 24; // airports rarely change → cache 24h
const FLIGHT_TTL = 60 * 5; // flight prices move → cache 5 min

// ---- OAuth token (cached in-memory until ~30s before expiry) ----
let tokenCache = { value: null, expiresAt: 0 };

const getAccessToken = async () => {
  const now = Date.now();
  if (tokenCache.value && now < tokenCache.expiresAt) {
    return tokenCache.value;
  }

  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
  });

  const { data } = await axios.post(`${BASE_URL}/v1/security/oauth2/token`, body.toString(), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    timeout: 12000,
  });

  tokenCache = {
    value: data.access_token,
    // refresh 30s early to avoid edge-of-expiry failures
    expiresAt: now + (data.expires_in - 30) * 1000,
  };
  return tokenCache.value;
};

const amadeusGet = async (path, params) => {
  const token = await getAccessToken();
  const { data } = await axios.get(`${BASE_URL}${path}`, {
    params,
    headers: { Authorization: `Bearer ${token}` },
    timeout: 15000,
  });
  return data;
};

// ---------------------------------------------------------------------------
// Normalizers: turn raw Amadeus payloads into the compact shape our UI wants.
// ---------------------------------------------------------------------------

const normalizeAirports = (raw) =>
  (raw.data || [])
    .filter((loc) => loc.iataCode)
    .map((loc) => ({
      code: loc.iataCode,
      name: loc.name,
      city: loc.address?.cityName || loc.name,
      country: loc.address?.countryName || '',
      subType: loc.subType,
    }));

const normalizeSegments = (segments = [], carriers = {}) =>
  segments.map((s) => ({
    from: s.departure?.iataCode,
    to: s.arrival?.iataCode,
    departureAt: s.departure?.at,
    arrivalAt: s.arrival?.at,
    carrierCode: s.carrierCode,
    carrierName: carriers[s.carrierCode] || s.carrierCode,
    flightNumber: s.number,
    duration: s.duration,
  }));

const normalizeFlightOffers = (raw) => {
  const carriers = raw.dictionaries?.carriers || {};
  return (raw.data || []).map((offer) => {
    const itineraries = offer.itineraries || [];
    const outbound = itineraries[0]?.segments || [];
    const inbound = itineraries[1]?.segments || [];
    const carrierCode = offer.validatingAirlineCodes?.[0] || outbound[0]?.carrierCode;
    const cabin = offer.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.cabin;

    return {
      id: offer.id,
      carrier: carrierCode,
      carrierName: carriers[carrierCode] || carrierCode,
      price: Number(offer.price?.grandTotal || offer.price?.total || 0),
      currency: offer.price?.currency || 'EUR',
      travelClass: cabin || 'ECONOMY',
      seatsLeft: offer.numberOfBookableSeats,
      stops: Math.max(outbound.length - 1, 0),
      outboundSegments: normalizeSegments(outbound, carriers),
      returnSegments: normalizeSegments(inbound, carriers),
    };
  });
};

// ---------------------------------------------------------------------------
// Public service methods (used by the controllers)
// ---------------------------------------------------------------------------

const searchAirports = async (keyword) => {
  const key = `airports:${keyword.toLowerCase()}`;
  const cached = responseCache.get(key);
  if (cached) return { ...cached, cached: true };

  let result;
  if (!hasCredentials()) {
    result = mockAirportSearch(keyword);
  } else {
    const raw = await amadeusGet('/v1/reference-data/locations', {
      subType: 'AIRPORT,CITY',
      keyword,
      'page[limit]': 8,
      view: 'LIGHT',
    });
    result = { mock: false, airports: normalizeAirports(raw) };
  }

  responseCache.set(key, result, AIRPORT_TTL);
  return { ...result, cached: false };
};

const searchFlights = async (params) => {
  const cacheKey =
    'flights:' +
    [
      params.origin,
      params.destination,
      params.departureDate,
      params.returnDate || 'oneway',
      params.adults,
      params.children,
      params.infants,
      params.travelClass,
      params.nonStop ? 'direct' : 'any',
    ].join('|');

  const cached = responseCache.get(cacheKey);
  if (cached) return { ...cached, cached: true };

  let result;
  if (!hasCredentials()) {
    result = mockFlightSearch(params);
  } else {
    const query = {
      originLocationCode: params.origin,
      destinationLocationCode: params.destination,
      departureDate: params.departureDate,
      adults: params.adults,
      currencyCode: params.currency || 'EUR',
      max: 25,
    };
    if (params.returnDate) query.returnDate = params.returnDate;
    if (params.children) query.children = params.children;
    if (params.infants) query.infants = params.infants;
    if (params.travelClass) query.travelClass = params.travelClass;
    if (params.nonStop) query.nonStop = true;

    const raw = await amadeusGet('/v2/shopping/flight-offers', query);
    result = { mock: false, offers: normalizeFlightOffers(raw) };
  }

  responseCache.set(cacheKey, result, FLIGHT_TTL);
  return { ...result, cached: false };
};

module.exports = {
  hasCredentials,
  searchAirports,
  searchFlights,
};
