import api from './axios';

/**
 * Search airports/cities for the autocomplete inputs.
 * Returns { airports: [{ code, name, city, country }], mock }.
 */
export const searchAirports = async (keyword, signal) => {
  return api.get('/airports/search', { params: { keyword }, signal });
};
