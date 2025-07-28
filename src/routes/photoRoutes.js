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

// Generate Cloudinary signature
router.post('/generate-signature', (req, res) => {
  try {
    const cloudinary = require('../utils/cloudinary');
    const timestamp = Math.round(new Date().getTime() / 1000);
    const folder = 'crystaloak'; // Allow folder override

    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp,
        folder,
      },
      cloudinary.config().api_secret
    );

    res.json({
      signature,
      timestamp,
      cloudName: cloudinary.config().cloud_name,
      apiKey: cloudinary.config().api_key,
      folder,
    });
  } catch (error) {
    console.log(error);
    
    res.status(500).json({ error: 'Failed to generate signature', details: error.message });
  }
});

module.exports = router; 