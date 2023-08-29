const auth = require('../middleware/authMiddleware');
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// User Registration Route
router.post('/register', userController.register);

// User Login Route
router.post('/login', userController.login);

// Protected Route for Testing
router.get('/protected', auth, (req, res) => {
  res.send('This is a protected route.');
});

module.exports = router;
