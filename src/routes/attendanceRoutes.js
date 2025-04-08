const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const auth = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(auth);

// Check-in and check-out routes
router.post('/check-in', attendanceController.markCheckIn);
router.post('/check-out', attendanceController.markCheckOut);

// Work images routes
router.post('/work-images', attendanceController.addWorkImages);
router.get('/work-images/:date', attendanceController.getWorkImages);

// Get attendance routes
router.get('/user/:userId', attendanceController.getUserAttendance);
router.get('/', attendanceController.getAllAttendance);
router.get('/status/:userId', attendanceController.checkCurrentStatus);

module.exports = router; 