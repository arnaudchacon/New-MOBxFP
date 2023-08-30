const Project = require('../models/project');
const { createFloorplan } = require('../services/floorplannerService');  // New import

exports.createProject = async (req, res) => {
  try {
    const { name, description } = req.body;
    const userId = req.user.userId;  // from JWT
    const floorPlan = req.file.path;  // New line to handle the uploaded file

    // Create a new floorplan on Floorplanner
    const floorplannerResponse = await createFloorplan(name, description);  // New line

    const project = await Project.create({
      name,
      description,
      userId,
      floorPlan,  // New line to save the file path in the database
      floorplannerId: floorplannerResponse.id  // New line to save Floorplanner project ID
    });

    res.status(201).json({
      message: 'Project created successfully',
      projectId: project.id,
      floorPlan: floorPlan,  // Optionally return the file path
      floorplannerId: floorplannerResponse.id  // Optionally return Floorplanner project ID
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error creating project',
      error
    });
  }
};

exports.getProjects = async (req, res) => {
  try {
    const projects = await Project.findAll({ where: { userId: req.user.userId } });
    res.status(200).json({ projects });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching projects', error });
  }
};

// Method to edit a project
exports.editProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    const userId = req.user.userId;

    const project = await Project.findOne({ where: { id, userId } });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    project.name = name;
    project.description = description;
    await project.save();

    res.status(200).json({ message: 'Project updated successfully', project });
  } catch (error) {
    res.status(500).json({ message: 'Error updating project', error });
  }
};

// Method to delete a project
exports.deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const project = await Project.findOne({ where: { id, userId } });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    await project.destroy();

    res.status(200).json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting project', error });
  }
};
