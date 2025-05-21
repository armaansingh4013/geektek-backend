const express = require('express');
const feedbackController = require('../controllers/feedbackController');
const router = express.Router();

router.post('/', feedbackController.createFeedback);
router.get('/', feedbackController.getAllFeedbacks);
router.delete('/:id', feedbackController.deleteFeedback);

module.exports = router;
