const { validationResult } = require('express-validator');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const { searchFlights } = require('../services/amadeusService');

/**
 * GET /api/flights/search
 * Query: origin, destination, departureDate, [returnDate], adults, children,
 *        infants, travelClass, nonStop
 * Proxies + caches the Amadeus Flight Offers Search.
 */
const getFlights = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, {
      status: 422,
      message: 'Invalid search parameters',
      errors: errors.array(),
    });
  }

  const params = {
    origin: String(req.query.origin).toUpperCase(),
    destination: String(req.query.destination).toUpperCase(),
    departureDate: req.query.departureDate,
    returnDate: req.query.returnDate || null,
    adults: Number(req.query.adults || 1),
    children: Number(req.query.children || 0),
    infants: Number(req.query.infants || 0),
    travelClass: req.query.travelClass || 'ECONOMY',
    nonStop: req.query.nonStop === 'true' || req.query.nonStop === true,
    currency: req.query.currency || 'EUR',
  };

  const result = await searchFlights(params);

  return sendSuccess(res, {
    data: {
      offers: result.offers,
      mock: result.mock,
      count: result.offers.length,
      query: params,
    },
    message: result.cached ? 'Served from cache' : 'OK',
  });
});

module.exports = { getFlights };
