/**
 * Tiny helpers that enforce ONE response shape across every app in the portfolio:
 *
 *   success -> { success: true,  data, message }
 *   failure -> { success: false, message, errors }
 *
 * Keeping the envelope identical means the React `api/` layer can unwrap every
 * response the same way, no matter which of the 12 apps it talks to.
 */

const sendSuccess = (res, { data = null, message = '', status = 200 } = {}) =>
  res.status(status).json({ success: true, data, message });

const sendError = (res, { message = 'Something went wrong', errors = [], status = 500 } = {}) =>
  res.status(status).json({ success: false, message, errors });

module.exports = { sendSuccess, sendError };
