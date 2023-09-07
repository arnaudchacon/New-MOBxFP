const auth = require('../middleware/authMiddleware');
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/register', (req, res, next) => {
  console.log("Request in /register:", req.body);
  next();
}, userController.register);

router.post('/login', (req, res, next) => {
  console.log("Request in /login:", req.body);
  next();
}, userController.login);

router.get('/protected', auth, (req, res) => {
  console.log("Request in /protected:", req.query);
  res.send('This is a protected route.');
});

module.exports = router;
