const Project = require('../models/project');
const { createFloorplan, editFloorplan, deleteFloorplan, createVloorOrder } = require('../services/floorplannerService');  // Updated import

// Create a new project
exports.createProject = async (req, res) => {
  try {
    const { name, description } = req.body;
    const userId = req.user.userId;  // from JWT

    // Create a new floorplan on Floorplanner
    const floorplannerResponse = await createFloorplan(name, description);  // Updated line

    const project = await Project.create({
      name,
      description,
      userId,
      floorplannerId: floorplannerResponse.id  // Updated line to save Floorplanner project ID
    });

    res.status(201).json({
      message: 'Project created successfully',
      projectId: project.id,
      floorplannerId: floorplannerResponse.id  // Updated line to return Floorplanner project ID
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error creating project',
      error
    });
  }
};

// Get all projects for a user
exports.getProjects = async (req, res) => {
  try {
    const projects = await Project.findAll({ where: { userId: req.user.userId } });
    res.status(200).json({ projects });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching projects', error });
  }
};

// Edit an existing project
exports.editProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    const userId = req.user.userId;

    const project = await Project.findOne({ where: { id, userId } });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Update the project in Floorplanner
    const floorplannerResponse = await editFloorplan(project.floorplannerId, name, description);  // Updated line

    project.name = name;
    project.description = description;
    await project.save();

    res.status(200).json({ message: 'Project updated successfully', project });
  } catch (error) {
    res.status(500).json({ message: 'Error updating project', error });
  }
};

// Delete a project
exports.deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const project = await Project.findOne({ where: { id, userId } });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Delete the project in Floorplanner
    await deleteFloorplan(project.floorplannerId);  // Updated line

    await project.destroy();

    res.status(200).json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting project', error });
  }
};

// Convert a project to Vloor  // New method
exports.convertToVloor = async (req, res) => {
  try {
    const { id } = req.params;  // Project ID from the URL
    const { image, imageType, width, name } = req.body;  // Parameters from the request body

    // Call the createVloorOrder function
    const vloorResponse = await createVloorOrder(id, image, imageType, width, name);  // New line

    res.status(200).json({
      message: 'Vloor conversion initiated successfully',
      vloorResponse  // New line
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error initiating Vloor conversion',
      error  // New line
    });
  }
};
