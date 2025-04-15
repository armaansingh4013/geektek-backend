const express = require('express');
const router = express.Router();
const siteController = require('../controllers/siteController');
const auth = require('../middleware/auth');

// All site routes require authentication
router.use(auth);

// Site routes
router.post('/', siteController.createSite);
router.get('/', siteController.getAllSites);
router.get('/enabled', siteController.getEnabledSites);
router.get('/:id', siteController.getSiteById);
router.put('/:id', siteController.updateSite);

// Holiday routes
router.post('/:id/holidays', siteController.addHoliday);
router.put('/:id/holidays/:holidayId', siteController.updateHoliday);
router.delete('/:id/holidays/:holidayId', siteController.deleteHoliday);
router.get('/:id/holidays', siteController.getSiteHolidays);

module.exports = router; 