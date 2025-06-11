const express = require('express');
const feedbackController = require('../controllers/feedbackController');
const router = express.Router();

router.post('/', feedbackController.createFeedback);
router.get('/', feedbackController.getAllFeedbacks);
router.get('/verified', feedbackController.getVerifiedFeedbacks);
router.delete('/:id', feedbackController.deleteFeedback);
router.patch('/:id/toggle-verify', feedbackController.toggleVerification);

module.exports = router;
