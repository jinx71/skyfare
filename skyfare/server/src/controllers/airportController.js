const { validationResult } = require('express-validator');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const { searchAirports } = require('../services/amadeusService');

/**
 * GET /api/airports/search?keyword=lon
 * Proxies the Amadeus airport/city lookup used by the autocomplete inputs.
 */
const getAirports = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, { status: 422, message: 'Invalid query', errors: errors.array() });
  }

  const keyword = String(req.query.keyword).trim();
  const result = await searchAirports(keyword);

  return sendSuccess(res, {
    data: { airports: result.airports, mock: result.mock },
    message: result.cached ? 'Served from cache' : 'OK',
  });
});

module.exports = { getAirports };
