const express = require('express');
const { body } = require('express-validator');
const {
  createBooking,
  listBookings,
  getBooking,
} = require('../controllers/bookingController');

const router = express.Router();

const createValidators = [
  body('tripType').isIn(['one-way', 'round-trip']).withMessage('Invalid trip type'),
  body('flight').isObject().withMessage('flight is required'),
  body('flight.price').isFloat({ min: 0 }).withMessage('flight.price is required'),
  body('flight.outboundSegments')
    .isArray({ min: 1 })
    .withMessage('flight must include at least one outbound segment'),
  body('passengers').isArray({ min: 1 }).withMessage('At least one passenger is required'),
  body('passengers.*.firstName').trim().notEmpty().withMessage('Passenger first name is required'),
  body('passengers.*.lastName').trim().notEmpty().withMessage('Passenger last name is required'),
  body('passengers.*.dateOfBirth').isISO8601().withMessage('Passenger date of birth is required'),
  body('passengers.*.title').isIn(['Mr', 'Mrs', 'Ms', 'Dr']).withMessage('Invalid title'),
  body('passengers.*.gender').isIn(['male', 'female', 'other']).withMessage('Invalid gender'),
  body('contact.email').isEmail().withMessage('A valid contact email is required'),
  body('contact.phone').trim().notEmpty().withMessage('Contact phone is required'),
];

router.route('/').get(listBookings).post(createValidators, createBooking);
router.get('/:reference', getBooking);

module.exports = router;
