const express = require('express');
const router = express.Router();
const photoController = require('../controllers/photoController');
const upload = require('../utils/fileUpload');
const auth = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(auth);

// Upload multiple photos
router.post('/upload-multiple', upload.array('photos', 100), photoController.uploadPhotos);

// Upload single photo
router.post('/upload-single', upload.single('photo'), photoController.uploadSinglePhoto);

module.exports = router; 