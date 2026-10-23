const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectsController');
const auth = require('../middleware/auth');


router.get('/names', projectController.getProjectNames);
router.get('/:id/images', projectController.getProjectImages);

router.get('/', projectController.getProjects);
router.post('/',auth, projectController.createProject);
router.put('/:id',auth, projectController.updateProject);
router.delete('/:id',auth, projectController.deleteProject);

module.exports = router;
