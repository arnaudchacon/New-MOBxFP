const axios = require('axios');
const base64 = require('base-64');

// Prepare Basic Authentication header
const username = process.env.FLOORPLANNER_API_USERNAME;
const password = process.env.FLOORPLANNER_API_PASSWORD;
const basicAuth = 'Basic ' + base64.encode(username + ':' + password);

// Axios instance for Floorplanner API
const floorplannerAPI = axios.create({
  baseURL: 'https://floorplanner.com/api/v2',
  headers: {
    'Authorization': basicAuth
  }
});

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

const deleteFloorplan = async (floorplannerId) => {
  try {
    await floorplannerAPI.delete(`/projects/${floorplannerId}`);
  } catch (error) {
    throw error;
  }
};

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

// New Function to generate or fetch the token
const getAccessTokenForProject = async (projectId) => {
  try {
    const response = await floorplannerAPI.post(`/projects/${projectId}/generate-token`);
    if (response.status !== 200) {
      throw new Error("Failed to generate token for project.");
    }
    return response.data.token;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createFloorplan,
  editFloorplan,
  deleteFloorplan,
  createVloorOrder,
  basicAuth,
  getAccessTokenForProject  // Export the new function
};
