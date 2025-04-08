const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const auth = require('../middleware/auth');
// const isAdmin = require('../middleware/isAdmin');

// Apply auth and admin middleware to all routes
router.use(auth);
// router.use(isAdmin);

// Shift routes
router.get('/shifts', settingsController.getAllShifts);
router.post('/shifts', settingsController.addShift);
router.put('/shifts/:shiftId', settingsController.updateShift);
router.delete('/shifts/:shiftId', settingsController.deleteShift);

// User shift routes
router.post('/shifts/assign/:userId', settingsController.assignShiftToUser);
router.get('/shifts/user/:userId', settingsController.getUserShift);

module.exports = router; 