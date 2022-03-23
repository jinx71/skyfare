require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const connectDB = require('./config/db');
const { hasCredentials } = require('./services/amadeusService');
const { sendSuccess } = require('./utils/apiResponse');

const airportRoutes = require('./routes/airportRoutes');
const flightRoutes = require('./routes/flightRoutes');
const bookingRoutes = require('./routes/bookingRoutes');

const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// ---- Security & core middleware ----
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// ---- Rate limiting on OUR routes (protects us + the upstream free tier) ----
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 120, // 120 req/min/IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please slow down', errors: [] },
});
app.use('/api', apiLimiter);

// ---- Health check ----
app.get('/api/health', (req, res) =>
  sendSuccess(res, {
    data: {
      status: 'ok',
      uptime: process.uptime(),
      amadeus: hasCredentials() ? 'live' : 'mock',
    },
    message: 'SkyFare API is running',
  })
);

// ---- Feature routes ----
app.use('/api/airports', airportRoutes);
app.use('/api/flights', flightRoutes);
app.use('/api/bookings', bookingRoutes);

// ---- 404 + centralized error handling (must be last) ----
app.use(notFound);
app.use(errorHandler);

const start = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log('\n──────────────────────────────────────────────');
    console.log(`✈️  SkyFare API listening on http://localhost:${PORT}`);
    console.log(`   Amadeus mode: ${hasCredentials() ? 'LIVE (real API)' : 'MOCK (no keys set)'}`);
    console.log('──────────────────────────────────────────────\n');
  });
};

start();

module.exports = app;
