const Project = require('../models/project');

exports.createProject = async (req, res) => {
  try {
    const { name, description } = req.body;
    const project = await Project.create({
      name,
      description,
      userId: req.user.userId // from JWT
    });
    res.status(201).json({ message: 'Project created successfully', projectId: project.id });
  } catch (error) {
    res.status(500).json({ message: 'Error creating project', error });
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
