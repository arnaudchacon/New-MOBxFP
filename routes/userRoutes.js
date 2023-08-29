const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// User Registration Route
router.post('/register', userController.register);

// User Login Route
router.post('/login', userController.login);

module.exports = router;
