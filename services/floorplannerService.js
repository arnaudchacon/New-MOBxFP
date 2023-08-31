const axios = require('axios');
const base64 = require('base-64');

// Prepare Basic Authentication header
const username = process.env.FLOORPLANNER_API_USERNAME; // Your Floorplanner API username from .env
const password = process.env.FLOORPLANNER_API_PASSWORD; // Your Floorplanner API password from .env
const basicAuth = 'Basic ' + base64.encode(username + ':' + password);

// Axios instance for Floorplanner API
const floorplannerAPI = axios.create({
  baseURL: 'https://floorplanner.com/api/v2',
  headers: {
    'Authorization': basicAuth
  }
});

// Function to create a new floorplan
const createFloorplan = async (name, description) => {
  try {
    const response = await floorplannerAPI.post('/projects', {
      name,
      description
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Function to edit an existing floorplan
const editFloorplan = async (floorplannerId, name, description) => {
  try {
    const response = await floorplannerAPI.put(`/projects/${floorplannerId}`, {
      name,
      description
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Function to delete an existing floorplan
const deleteFloorplan = async (floorplannerId) => {
  try {
    await floorplannerAPI.delete(`/projects/${floorplannerId}`);
  } catch (error) {
    throw error;
  }
};

// Function to create a Vloor order  // New function
const createVloorOrder = async (projectId, image, imageType, width, name) => {
  try {
    const response = await floorplannerAPI.post('/services/vloor/orders/create.json', {
      project_id: projectId,
      image,
      image_type: imageType,
      width,
      name
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createFloorplan,
  editFloorplan,
  deleteFloorplan,
  createVloorOrder  // New export
};
