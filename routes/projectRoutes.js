const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const auth = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post('/create', auth, upload.single('floorPlan'), projectController.createProject);
router.get('/list', auth, projectController.getProjects);  // Changed this line

module.exports = router;
