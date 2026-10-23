const express = require('express');
const router = express.Router();
const inquiryController = require('../controllers/inquiryController');

router.post('/', inquiryController.createInquiry);

router.patch('/:id', inquiryController.updateInquiry);
router.get('/', inquiryController.getAllInquiries);

module.exports = router;
