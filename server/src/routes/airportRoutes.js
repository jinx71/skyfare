const express = require('express');
const { query } = require('express-validator');
const { getAirports } = require('../controllers/airportController');

const router = express.Router();

router.get(
  '/search',
  [
    query('keyword')
      .trim()
      .isLength({ min: 2 })
      .withMessage('Type at least 2 characters to search airports'),
  ],
  getAirports
);

module.exports = router;
