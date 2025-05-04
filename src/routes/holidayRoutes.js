const express = require('express');
const router = express.Router();
const { createHoliday, getAllHolidays } = require('../controllers/holidayController');
const auth = require('../middleware/auth');

router.use(auth);

// Create a new holiday
router.post('/', createHoliday);

// Get all holidays
router.get('/', getAllHolidays);

module.exports = router; 