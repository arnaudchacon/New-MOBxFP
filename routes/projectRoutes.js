const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const auth = require('../middleware/authMiddleware');

router.post('/create', auth, projectController.createProject);
router.get('/list', auth, projectController.getProjects);  // Changed this line

module.exports = router;
