const mongoose = require('mongoose');

const passengerSchema = new mongoose.Schema(
  {
    title: { type: String, enum: ['Mr', 'Mrs', 'Ms', 'Dr'], required: true },
    firstName: { type: String, required: [true, 'First name is required'], trim: true },
    lastName: { type: String, required: [true, 'Last name is required'], trim: true },
    dateOfBirth: { type: Date, required: [true, 'Date of birth is required'] },
    gender: { type: String, enum: ['male', 'female', 'other'], required: true },
  },
  { _id: false }
);

const segmentSchema = new mongoose.Schema(
  {
    from: String,
    to: String,
    departureAt: String,
    arrivalAt: String,
    carrierCode: String,
    flightNumber: String,
    duration: String,
  },
  { _id: false }
);

const bookingSchema = new mongoose.Schema(
  {
    reference: {
      type: String,
      required: true,
      unique: true,
      index: true,
      uppercase: true,
    },
    tripType: { type: String, enum: ['one-way', 'round-trip'], required: true },
    origin: { type: String, required: true, uppercase: true, minlength: 3, maxlength: 3 },
    destination: { type: String, required: true, uppercase: true, minlength: 3, maxlength: 3 },
    departureDate: { type: String, required: true },
    returnDate: { type: String, default: null },
    travelClass: {
      type: String,
      enum: ['ECONOMY', 'PREMIUM_ECONOMY', 'BUSINESS', 'FIRST'],
      default: 'ECONOMY',
    },

    // Snapshot of the selected Amadeus offer so the booking is self-contained,
    // even if the live offer later expires.
    flight: {
      carrier: String,
      price: { type: Number, required: true },
      currency: { type: String, default: 'EUR' },
      outboundSegments: [segmentSchema],
      returnSegments: [segmentSchema],
    },

    passengers: {
      type: [passengerSchema],
      validate: [(v) => Array.isArray(v) && v.length > 0, 'At least one passenger is required'],
    },

    contact: {
      email: {
        type: String,
        required: [true, 'Contact email is required'],
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
      },
      phone: { type: String, required: [true, 'Contact phone is required'], trim: true },
    },

    // Mock payment only — no real card data is ever stored or charged.
    payment: {
      cardholder: String,
      last4: { type: String, maxlength: 4 },
      amount: Number,
      currency: { type: String, default: 'EUR' },
    },

    status: { type: String, enum: ['confirmed', 'cancelled'], default: 'confirmed' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Booking', bookingSchema);
