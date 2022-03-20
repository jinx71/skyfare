const ApiError = require('../utils/ApiError');
const { sendError } = require('../utils/apiResponse');

/* eslint-disable no-unused-vars */
/**
 * Single place where every error funnels (via asyncHandler / next(err)).
 * Normalises Mongoose, JWT, Axios and custom ApiError into one envelope.
 */
const errorHandler = (err, req, res, next) => {
  let status = err.statusCode || 500;
  let message = err.message || 'Internal server error';
  let errors = err.errors || [];

  // Mongoose: bad ObjectId
  if (err.name === 'CastError') {
    status = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // Mongoose: schema validation
  if (err.name === 'ValidationError') {
    status = 400;
    message = 'Validation failed';
    errors = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
  }

  // Mongoose: duplicate key
  if (err.code === 11000) {
    status = 409;
    const field = Object.keys(err.keyValue || {})[0];
    message = `Duplicate value for "${field}"`;
  }

  // JWT
  if (err.name === 'JsonWebTokenError') {
    status = 401;
    message = 'Invalid token';
  }
  if (err.name === 'TokenExpiredError') {
    status = 401;
    message = 'Token expired';
  }

  // Axios error bubbling up from a third-party service (Amadeus)
  if (err.isAxiosError) {
    status = err.response?.status || 502;
    message = err.response?.data?.errors?.[0]?.detail || 'Upstream API request failed';
  }

  if (status >= 500) {
    console.error('💥', err);
  }

  sendError(res, { status, message, errors });
};

module.exports = errorHandler;
