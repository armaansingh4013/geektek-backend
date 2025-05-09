const express = require('express');
const router = express.Router();
const estimationController = require('../controllers/estimationController');
const auth = require('../middleware/auth');

// Public routes
router.post('/', estimationController.createEstimation);

// Protected routes (require authentication)
router.get('/', auth, estimationController.getAllEstimations);
router.get('/:id', auth, estimationController.getEstimationById);
router.put('/:id', auth, estimationController.updateEstimation);
router.delete('/:id', auth, estimationController.deleteEstimation);

module.exports = router;