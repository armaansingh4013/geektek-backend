const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

// Apply auth middleware to protected routes
router.use(auth);

// Self update routes
router.put('/profile', userController.updateSelf);
router.put('/change-password', userController.changeOwnPassword);
// User routes
router.post('/', userController.createUser);
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

module.exports = router; 