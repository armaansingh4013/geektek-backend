const express = require('express');
const router = express.Router();
const videoController = require('../controllers/videoController');
const videoUpload = require('../utils/videoUpload');
const auth = require('../middleware/auth');


// Video upload routes
router.post('/upload', videoUpload.array('videos', 5), videoController.uploadVideos);
router.post('/upload/single', videoUpload.single('video'), videoController.uploadSingleVideo);
router.delete('/:public_id', videoController.deleteVideo);

module.exports = router;