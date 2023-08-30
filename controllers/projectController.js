const Project = require('../models/project');

exports.createProject = async (req, res) => {
    try {
      const { name, description } = req.body;
      const userId = req.user.userId;  // from JWT
      const floorPlan = req.file.path;  // New line to handle the uploaded file
  
      const project = await Project.create({
        name,
        description,
        userId,
        floorPlan  // New line to save the file path in the database
      });
  
      res.status(201).json({
        message: 'Project created successfully',
        projectId: project.id,
        floorPlan: floorPlan  // Optionally return the file path
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

// Add more methods for editing and deleting projects later
