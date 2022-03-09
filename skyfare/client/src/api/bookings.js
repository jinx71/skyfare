import api from './axios';

export const createBooking = async (payload) => {
  return api.post('/bookings', payload);
};

export const listBookings = async (email) => {
  return api.get('/bookings', { params: email ? { email } : {} });
};

export const getBooking = async (reference) => {
  return api.get(`/bookings/${reference}`);
};
