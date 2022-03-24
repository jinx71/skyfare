/**
 * Status-aware error. Throw this from controllers/services and the central
 * errorHandler will map it to the right HTTP status + message.
 *
 *   throw new ApiError(404, 'Booking not found');
 */
class ApiError extends Error {
  constructor(statusCode, message, errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ApiError;
