const express = require('express');
const router = express.Router();
const { createHoliday, getAllHolidays, updateHoliday, deleteHoliday } = require('../controllers/holidayController');
const auth = require('../middleware/auth');

router.use(auth);

// Create a new holiday
router.post('/', createHoliday);

// Get all holidays
router.get('/', getAllHolidays);

// Update a holiday
router.put('/:id', updateHoliday);

// Delete a holiday
router.delete('/:id', deleteHoliday);

module.exports = router; 