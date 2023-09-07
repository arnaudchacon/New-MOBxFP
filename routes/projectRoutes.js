const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const auth = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post('/create', auth, upload.single('floorPlan'), (req, res, next) => {
  console.log("Request in /create:", req.body, req.file);
  next();
}, projectController.createProject);

router.get('/list', auth, (req, res, next) => {
  console.log("Request in /list:", req.query);
  next();
}, projectController.getProjects);

router.put('/edit/:id', auth, (req, res, next) => {
  console.log("Request in /edit/:id:", req.params.id, req.body);
  next();
}, projectController.editProject);

router.delete('/delete/:id', auth, (req, res, next) => {
  console.log("Request in /delete/:id:", req.params.id);
  next();
}, projectController.deleteProject);

router.delete('/deleteAll', async (req, res) => {
  try {
    console.log("Request in /deleteAll:");
    await Project.destroy({ where: {} });
    res.json({ message: "All projects deleted successfully" });
  } catch (error) {
    console.log("Error in /deleteAll:", error);
    res.status(500).json({ message: "An error occurred", error });
  }
});

module.exports = router;
