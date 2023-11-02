const Project = require('../models/project');
const axios = require('axios');
const { createFloorplan, editFloorplan, deleteFloorplan, createVloorOrder } = require('../services/floorplannerService');
const { basicAuth } = require('../services/floorplannerService');

console.log('Project Controller: Initialized');

exports.showCreateForm = async (req, res) => {
    try {
        res.render('createProjectForm');
    } catch (error) {
        console.error('Error displaying the project creation form:', error);
        res.status(500).send('Error displaying the project creation form');
    }
};

exports.createAndRedirect = async (req, res) => {
    try {
        const { name, description, email } = req.body;
        const userId = req.user.userId;

        console.log(`Creating project with name: ${name}, for user ID: ${userId}`);

        const floorplannerResponse = await createFloorplan({ name, description, email });  // Pass the data as an object
        console.log(`Floorplanner project created with ID: ${floorplannerResponse.id}`);

        const project = await Project.create({
            name,
            description,
            email,
            userId,
            floorplannerId: floorplannerResponse.id
        });

        const response = await axios.get(`https://floorplanner.com/api/v2/projects/${floorplannerResponse.id}/token.json`, {
            headers: {
                'Authorization': basicAuth,
                'accept': 'application/json'
            }
        });
        const projectToken = response.data.token;

        res.redirect(`https://floorplanner.com/api/v2/projects/${floorplannerResponse.id}/editor?token=${projectToken}`);
    } catch (error) {
        console.error('Error creating project and redirecting:', error);
        res.status(500).send('Error creating project and redirecting');
    }
};

exports.fetchProjectToken = async (req, res) => {
    try {
        const projectId = req.params.id;
        console.log(`Fetching token for project ID: ${projectId}`);

        const response = await axios.get(`https://floorplanner.com/api/v2/projects/${projectId}/token.json`, {
            headers: {
                'Authorization': basicAuth,
                'accept': 'application/json'
            }
        });
        const projectToken = response.data.token;
        res.status(200).json({ projectToken });
    } catch (error) {
        console.error('Error fetching project token:', error);
        res.status(500).json({ message: 'Error fetching project token' });
    }
};

exports.createProject = async (req, res) => {
    try {
        const { name, description } = req.body;
        const userId = req.user.userId;

        console.log(`Attempting to create new project: ${name} for user ID: ${userId}`);

        const floorplannerResponse = await createFloorplan({ name, description });  // Adjusted this call
        console.log(`Floorplanner project created with ID: ${floorplannerResponse.id}`);

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
        console.error('Error creating project:', error);
        res.status(500).json({ message: 'Error creating project' });
    }
};

exports.getProjects = async (req, res) => {
    try {
        const userId = req.user.userId;
        console.log(`Fetching projects for user ID: ${userId}`);

        const projects = await Project.findAll({ where: { userId } });
        res.status(200).json({ projects });
    } catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).json({ message: 'Error fetching projects' });
    }
};

exports.editProject = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;
        const userId = req.user.userId;

        console.log(`Attempting to edit project ID: ${id} for user ID: ${userId}`);

        const project = await Project.findOne({ where: { id, userId } });

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        const floorplannerResponse = await editFloorplan(project.floorplannerId, { name, description });  // Adjusted this call
        console.log(`Floorplanner project with ID: ${floorplannerResponse.id} updated`);

        project.name = name;
        project.description = description;
        await project.save();

        res.status(200).json({ message: 'Project updated successfully', project });
    } catch (error) {
        console.error('Error updating project:', error);
        res.status(500).json({ message: 'Error updating project' });
    }
};

exports.deleteProject = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        console.log(`Attempting to delete project ID: ${id} for user ID: ${userId}`);

        const project = await Project.findOne({ where: { id, userId } });

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        await deleteFloorplan(project.floorplannerId);
        console.log(`Floorplanner project with ID: ${project.floorplannerId} deleted`);

        await project.destroy();

        res.status(200).json({ message: 'Project deleted successfully' });
    } catch (error) {
        console.error('Error deleting project:', error);
        res.status(500).json({ message: 'Error deleting project' });
    }
};

exports.convertToVloor = async (req, res) => {
    try {
        const { id, image, imageType, width, name } = req.body;

        console.log(`Initiating Vloor conversion for project ID: ${id}`);

        const vloorResponse = await createVloorOrder({ id, image, imageType, width, name });  // Pass the data as an object
        console.log(`Vloor conversion initiated for project ID: ${id}`);

        res.status(200).json({
            message: 'Vloor conversion initiated successfully',
            vloorResponse
        });
    } catch (error) {
        console.error('Error initiating Vloor conversion:', error);
        res.status(500).json({ message: 'Error initiating Vloor conversion' });
    }
};
