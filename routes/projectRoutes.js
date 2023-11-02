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

// Route to display the form for creating a new project (you might need to create a corresponding controller function)
router.get('/create-form', auth, projectController.showCreateForm); 

// Route to handle the form submission and then redirect to the floorplanner editor
router.post('/create-and-redirect', auth, projectController.createAndRedirect);

// Route for fetching a project-specific token
router.get('/get-floorplanner-token', auth, projectController.getFloorplannerToken);

// Route to create a new project with a file upload
router.post('/create', auth, upload.single('floorPlan'), projectController.createProject);

// Route to list all projects for a user
router.get('/list', auth, projectController.getProjects);

// Route to edit an existing project
router.put('/edit/:id', auth, projectController.editProject);

// Route to delete a project
router.delete('/delete/:id', auth, projectController.deleteProject);

module.exports = router;
