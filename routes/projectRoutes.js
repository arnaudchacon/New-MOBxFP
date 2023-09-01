const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const auth = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post('/create', auth, upload.single('floorPlan'), projectController.createProject);
router.get('/list', auth, projectController.getProjects);  // Changed this line

// Route to edit a project
router.put('/edit/:id', auth, projectController.editProject);

// Route to delete a project
router.delete('/delete/:id', auth, projectController.deleteProject);

// Route to convert a project to Vloor
//router.post('/convert-to-vloor/:id', auth, projectController.convertToVloor);

module.exports = router;
