const express = require('express');
const router = express.Router();
const { createWebsite, getAllWebsites, updateWebsite, deleteWebsite, getWebsite } = require('../controllers/websiteController');
const auth = require('../middleware/auth');

router.use(auth);

// Create a new Website
router.post('/', createWebsite);

// Get all Websites
router.get('/', getAllWebsites);

// Get Website
router.get('/:id', getWebsite);

// Update a Website
router.put('/:id', updateWebsite);

// Delete a Website
router.delete('/:id', deleteWebsite);

module.exports = router; 