const express = require('express');
const app = express();
const PORT = 3000;
const db = require('./config/database');
const userRoutes = require('./routes/userRoutes');

app.get('/', (req, res) => {
    res.send('Hello, World!');
});

// Use the user routes
app.use('/user', userRoutes);

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
