const axios = require('axios');

// Axios instance for Floorplanner API
const floorplannerAPI = axios.create({
  baseURL: 'https://floorplanner.com/api/v2', // Replace with the actual Floorplanner API base URL
  headers: {
    'Authorization': process.env.FLOORPLANNER_BASIC_AUTH,
    'Api-Key': process.env.FLOORPLANNER_API_KEY
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

module.exports = {
  createFloorplan
};
