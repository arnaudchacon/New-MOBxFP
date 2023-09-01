require('dotenv').config();
const express = require('express');
const cors = require('cors');  // Import CORS package
const app = express();
const PORT = 3000;
const db = require('./config/database');
const userRoutes = require('./routes/userRoutes');
const projectRoutes = require('./routes/projectRoutes');

// Enable CORS for all routes
app.use(cors());

// Middleware for parsing JSON request bodies
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello, World!');
});

// Use the user routes
app.use('/user', userRoutes);

// Use the project routes
app.use('/project', projectRoutes);

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

db.authenticate()
  .then(() => {
    console.log('Database connected...');
  })
  .catch(err => {
    console.error('Error:', err);
  });
