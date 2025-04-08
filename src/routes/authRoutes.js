const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

// Authentication routes
// router.post('/register', authController.register);
router.post('/login', authController.login);
// router.get('/verify-email', authController.verifyEmail);
// router.post('/verify-phone', authController.verifyPhone);
// router.post('/forgot-password', authController.forgotPassword);
// router.post('/reset-password', authController.resetPassword);

// Protected routes
router.get('/profile', auth, authController.getProfile);
router.post('/change-password', auth, authController.changePassword);

module.exports = router; 