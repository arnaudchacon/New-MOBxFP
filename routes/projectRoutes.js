const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const auth = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Middleware for logging requests
const logRequest = (req, res, next) => {
    console.log(`Request to ${req.path}:`, req.body, req.file || req.query);
    next();
};

router.use(logRequest);  // Apply logging middleware to all routes below

// Route for a project specific token
router.get('/fetch-project-token/:id', auth, projectController.fetchProjectToken);

router.post('/create', auth, upload.single('floorPlan'), projectController.createProject);

router.get('/list', auth, projectController.getProjects);

router.put('/edit/:id', auth, projectController.editProject);

router.delete('/delete/:id', auth, projectController.deleteProject);

// router.delete('/delete/:id', auth, projectController.deleteProject);

module.exports = router;
