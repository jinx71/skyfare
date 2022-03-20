const { validationResult } = require('express-validator');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const Booking = require('../models/Booking');

// Human-friendly, hard-to-collide reference like "SKY-7F3A9K".
const makeReference = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let suffix = '';
  for (let i = 0; i < 6; i += 1) {
    suffix += chars[Math.floor(Math.random() * chars.length)];
  }
  return `SKY-${suffix}`;
};

/**
 * POST /api/bookings
 * Persists a booking from the selected flight + passenger details.
 */
const createBooking = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, { status: 422, message: 'Validation failed', errors: errors.array() });
  }

  const { tripType, flight, passengers, contact, payment } = req.body;

  // Generate a unique reference, retrying on the rare collision.
  let reference;
  for (let attempt = 0; attempt < 5; attempt += 1) {
    reference = makeReference();
    const exists = await Booking.exists({ reference });
    if (!exists) break;
  }

  const booking = await Booking.create({
    reference,
    tripType,
    origin: flight.outboundSegments?.[0]?.from,
    destination: flight.outboundSegments?.[flight.outboundSegments.length - 1]?.to,
    departureDate: flight.outboundSegments?.[0]?.departureAt?.slice(0, 10),
    returnDate: flight.returnSegments?.[0]?.departureAt?.slice(0, 10) || null,
    travelClass: flight.travelClass || 'ECONOMY',
    flight: {
      carrier: flight.carrierName || flight.carrier,
      price: flight.price,
      currency: flight.currency || 'EUR',
      outboundSegments: flight.outboundSegments || [],
      returnSegments: flight.returnSegments || [],
    },
    passengers,
    contact,
    payment: {
      cardholder: payment?.cardholder,
      last4: payment?.last4,
      amount: flight.price,
      currency: flight.currency || 'EUR',
    },
  });

  return sendSuccess(res, {
    status: 201,
    data: booking,
    message: 'Booking confirmed',
  });
});

/**
 * GET /api/bookings?email=foo@bar.com
 * Lists recent bookings, optionally filtered by contact email.
 */
const listBookings = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.email) {
    filter['contact.email'] = String(req.query.email).toLowerCase().trim();
  }

  const bookings = await Booking.find(filter).sort({ createdAt: -1 }).limit(50).lean();

  return sendSuccess(res, { data: bookings, message: `${bookings.length} booking(s)` });
});

/**
 * GET /api/bookings/:reference
 */
const getBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findOne({
    reference: String(req.params.reference).toUpperCase(),
  }).lean();

  if (!booking) {
    throw new ApiError(404, `No booking found for reference ${req.params.reference}`);
  }

  return sendSuccess(res, { data: booking, message: 'OK' });
});

module.exports = { createBooking, listBookings, getBooking };
