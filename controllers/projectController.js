const Project = require('../models/project');
const { createFloorplan, editFloorplan, deleteFloorplan, createVloorOrder } = require('../services/floorplannerService');

console.log('Project Controller: Loaded'); // Logging the initialization

// Create a new project
exports.createProject = async (req, res) => {
  try {
    console.log('Creating new project...', req.body); // Logging the request body
    const { name, description } = req.body;
    const userId = req.user.userId;

    console.log(`Requesting Floorplanner to create project: ${name}`); // Logging
    const floorplannerResponse = await createFloorplan(name, description);
    
    console.log(`Floorplanner project created with ID: ${floorplannerResponse.id}`); // Logging

    const project = await Project.create({
      name,
      description,
      userId,
      floorplannerId: floorplannerResponse.id
    });

    res.status(201).json({
      message: 'Project created successfully',
      projectId: project.id,
      floorplannerId: floorplannerResponse.id
    });
  } catch (error) {
    console.error('Error creating project:', error); // Logging
    res.status(500).json({
      message: 'Error creating project',
      error
    });
  }
};

// Get all projects for a user
exports.getProjects = async (req, res) => {
  try {
    console.log('Fetching projects for user:', req.user.userId); // Logging
    const projects = await Project.findAll({ where: { userId: req.user.userId } });
    res.status(200).json({ projects });
  } catch (error) {
    console.error('Error fetching projects:', error); // Logging
    res.status(500).json({ message: 'Error fetching projects', error });
  }
};

// Edit an existing project
exports.editProject = async (req, res) => {
  try {
    console.log('Editing project...', req.params, req.body); // Logging
    const { id } = req.params;
    const { name, description } = req.body;
    const userId = req.user.userId;

    const project = await Project.findOne({ where: { id, userId } });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Update the project in Floorplanner
    const floorplannerResponse = await editFloorplan(project.floorplannerId, name, description); // Updated line

    project.name = name;
    project.description = description;
    await project.save();

    res.status(200).json({ message: 'Project updated successfully', project });
  } catch (error) {
    console.error('Error updating project:', error); // Logging
    res.status(500).json({ message: 'Error updating project', error });
  }
};

// Delete a project
exports.deleteProject = async (req, res) => {
  try {
    console.log('Deleting project...', req.params); // Logging
    const { id } = req.params;
    const userId = req.user.userId;

    const project = await Project.findOne({ where: { id, userId } });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Delete the project in Floorplanner
    await deleteFloorplan(project.floorplannerId); // Updated line

    await project.destroy();

    res.status(200).json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error); // Logging
    res.status(500).json({ message: 'Error deleting project', error });
  }
};

// Convert a project to Vloor  // New method
exports.convertToVloor = async (req, res) => {
  try {
    console.log('Initiating Vloor conversion...', req.params, req.body); // Logging
    const { id } = req.params; // Project ID from the URL
    const { image, imageType, width, name } = req.body; // Parameters from the request body

    // Call the createVloorOrder function
    const vloorResponse = await createVloorOrder(id, image, imageType, width, name); // New line

    res.status(200).json({
      message: 'Vloor conversion initiated successfully',
      vloorResponse // New line
    });
  } catch (error) {
    console.error('Error initiating Vloor conversion:', error); // Logging
    res.status(500).json({
      message: 'Error initiating Vloor conversion',
      error // New line
    });
  }
};
