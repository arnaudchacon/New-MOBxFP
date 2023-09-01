require('dotenv').config();
const express = require('express');
const cors = require('cors');  // Import CORS package
const path = require('path');  // Import Path package
const session = require('express-session');  // Import Session package
const passport = require('passport');  // Import Passport package
const OAuth2Strategy = require('passport-oauth2');  // Import OAuth2Strategy package
const app = express();
const PORT = 3000;
const db = require('./config/database');
const userRoutes = require('./routes/userRoutes');
const projectRoutes = require('./routes/projectRoutes');

// Enable CORS for all routes
app.use(cors());

// Middleware for parsing JSON request bodies
app.use(express.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Initialize Session
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-fallback-secret-key',  // Choose a strong secret key
  resave: false,
  saveUninitialized: true
}));


// Initialize Passport and session support
app.use(passport.initialize());
app.use(passport.session());

// Passport Configuration
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

passport.use('provider', new OAuth2Strategy({
  authorizationURL: 'https://floorplanner.com/oauth/authorize',
  tokenURL: 'https://floorplanner.com/oauth/token',
  clientID: process.env.FLOORPLANNER_CLIENT_ID,
  clientSecret: process.env.FLOORPLANNER_CLIENT_SECRET,
  callbackURL: 'http://localhost:3000/floorplanner/callback',
  state: true
},
(accessToken, refreshToken, profile, done) => {
  // Store the accessToken in session
  if (profile) {
    profile.accessToken = accessToken;
  }
  return done(null, profile);
}));

// Define Routes
app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.get('/auth/provider', passport.authenticate('provider'));

app.get('/floorplanner/callback', 
  passport.authenticate('provider', { failureRedirect: '/' }),
  (req, res) => {
    // The OAuth accessToken is now stored in req.session.passport.user.accessToken
    res.redirect('/');  // Redirect to wherever you want after a successful OAuth login
  }
);

// Use the user routes
app.use('/user', userRoutes);

// Use the project routes
app.use('/project', projectRoutes);

// Start the Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Database Authentication
db.authenticate()
  .then(() => {
    console.log('Database connected...');
  })
  .catch(err => {
    console.error('Error:', err);
  });
