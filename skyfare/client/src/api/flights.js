import api from './axios';

/**
 * Search flight offers. `params` is the validated search object:
 * { origin, destination, departureDate, returnDate?, adults, children,
 *   infants, travelClass, nonStop }
 * Returns { offers, mock, count, query }.
 */
export const searchFlights = async (params, signal) => {
  return api.get('/flights/search', { params, signal });
};
