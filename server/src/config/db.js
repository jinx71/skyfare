const mongoose = require('mongoose');

/**
 * Connects to MongoDB. We log a clear warning instead of hard-crashing the
 * server when Mongo is unreachable: flight SEARCH (Amadeus) still works without
 * a database, and booking routes will surface a clean error if the DB is down.
 */
const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.warn('⚠️  MONGO_URI is not set — booking features will be unavailable.');
    return;
  }

  try {
    mongoose.set('strictQuery', true);
    const conn = await mongoose.connect(uri);
    console.log(`✅ MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (err) {
    console.warn(`⚠️  MongoDB connection failed: ${err.message}`);
    console.warn('   The server will keep running so flight search still works.');
  }
};

module.exports = connectDB;
