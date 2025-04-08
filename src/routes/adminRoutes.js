const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');

// Admin middleware to check if user is admin
const isAdmin = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Apply auth and admin middleware to all routes
router.use(auth);
router.use(isAdmin);

// Dashboard data
router.get('/dashboard', adminController.getDashboardData);

// Employee management routes
router.get('/employees', adminController.getAllEmployees);
router.get('/employees/enabled', adminController.getEnabledEmployees);
router.put('/employees/:employeeId', adminController.updateEmployee);
router.put('/employees/:employeeId/shift', adminController.updateShift);

// Attendance routes
router.get('/attendance/date/:date', adminController.getDateAttendance);
router.get('/attendance/report', adminController.getEmployeeReport);
router.get('/attendance/:employeeId/:date', adminController.getEmployeeDateDetail);

module.exports = router; 