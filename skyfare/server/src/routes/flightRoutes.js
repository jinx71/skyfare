const express = require('express');
const { query } = require('express-validator');
const { getFlights } = require('../controllers/flightController');

const router = express.Router();

const isFutureDate = (value) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(value) >= today;
};

router.get(
  '/search',
  [
    query('origin').trim().isLength({ min: 3, max: 3 }).withMessage('Origin must be a 3-letter code'),
    query('destination')
      .trim()
      .isLength({ min: 3, max: 3 })
      .withMessage('Destination must be a 3-letter code')
      .custom((value, { req }) => value.toUpperCase() !== String(req.query.origin).toUpperCase())
      .withMessage('Origin and destination must differ'),
    query('departureDate')
      .isISO8601()
      .withMessage('departureDate must be YYYY-MM-DD')
      .custom(isFutureDate)
      .withMessage('departureDate cannot be in the past'),
    query('returnDate')
      .optional({ checkFalsy: true })
      .isISO8601()
      .withMessage('returnDate must be YYYY-MM-DD')
      .custom((value, { req }) => new Date(value) >= new Date(req.query.departureDate))
      .withMessage('returnDate must be on or after departureDate'),
    query('adults').optional().isInt({ min: 1, max: 9 }).withMessage('adults must be 1–9'),
    query('children').optional().isInt({ min: 0, max: 9 }),
    query('infants').optional().isInt({ min: 0, max: 9 }),
    query('travelClass')
      .optional()
      .isIn(['ECONOMY', 'PREMIUM_ECONOMY', 'BUSINESS', 'FIRST'])
      .withMessage('Invalid travel class'),
  ],
  getFlights
);

module.exports = router;
