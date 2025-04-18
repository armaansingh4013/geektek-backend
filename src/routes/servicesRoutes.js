const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/servicesController');
const auth = require('../middleware/auth');


router.get('/names', serviceController.getServiceNames);
router.get('/:id/images', serviceController.getServiceImages);

router.get('/', serviceController.getServices);
router.post('/',auth, serviceController.createService);
router.put('/:id',auth, serviceController.updateService);
router.delete('/:id',auth, serviceController.deleteService);

module.exports = router;
