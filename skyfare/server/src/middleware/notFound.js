const { sendError } = require('../utils/apiResponse');

/**
 * Catches any request that didn't match a route and returns the standard
 * failure envelope with a 404.
 */
const notFound = (req, res) => {
  sendError(res, {
    status: 404,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};

module.exports = notFound;
