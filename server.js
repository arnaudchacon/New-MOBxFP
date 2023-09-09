require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const session = require('express-session');
const passport = require('passport');
const OAuth2Strategy = require('passport-oauth2');
const fetch = require('node-fetch');  // Make sure you've installed this
const app = express();
const PORT = 3000;
const db = require('./config/database');
const userRoutes = require('./routes/userRoutes');
const projectRoutes = require('./routes/projectRoutes');

console.log("Environment Variables:", process.env.FLOORPLANNER_CLIENT_ID, process.env.FLOORPLANNER_CLIENT_SECRET);

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: process.env.SESSION_SECRET || 'your-fallback-secret-key',
  resave: false,
  saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

passport.serializeUser((user, done) => {
  console.log("Serializing user:", user);
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  console.log("Deserializing object:", obj);
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
  console.log("Access Token:", accessToken);
  console.log("Profile:", profile);
  if (profile) {
    profile.accessToken = accessToken;
  }
  return done(null, profile);
}));

async function fetchProjectToken(projectId, oauthToken) {
  const response = await fetch(`https://floorplanner.com/api/v2/projects/${projectId}/token.json`, {
      method: 'GET',
      headers: {
          'Authorization': `Bearer ${oauthToken}`,
          'Accept': 'application/json'
      }
  });
  const data = await response.json();
  if (!data.token) {
      throw new Error('Failed to fetch project token from Floorplanner');
  }
  return data.token;
}

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.get('/test',(req, res) => {
  res.render("test",{testData: "this is a test"})
})

app.get('/auth/provider', passport.authenticate('provider'));

app.get('/floorplanner/callback', 
  passport.authenticate('provider', { failureRedirect: '/' }),
  (req, res) => {
    console.log("User object after OAuth callback:", req.session.passport.user);
    res.redirect('/floorplanner-editor');
  }
);

app.get('/fetch-project-token', async (req, res) => {
  const oauthToken = req.session?.passport?.user?.accessToken;
  const projectId = 145411566;  // This should ideally be dynamic, based on your application's logic

  console.log("Fetching project token with OAuth token:", oauthToken);  // Log the OAuth token here

  if (!oauthToken) {
    return res.status(400).json({ message: 'OAuth token not found.' });
  }

  try {
      const projectToken = await fetchProjectToken(projectId, oauthToken);
      console.log("Fetched project token:", projectToken);  // Log the fetched project token here
      return res.json({ projectToken });
  } catch (error) {
      console.error("Error fetching project token:", error.message);  // Enhanced logging
      return res.status(500).json({ message: error.message });
  }
});

app.get('/floorplanner', (req, res) => {
  console.log("Session in /floorplanner:", req.session);
  const authToken = req.session?.passport?.user?.accessToken;
  if (!authToken) {
    return res.redirect('/auth/provider');
  }
  res.sendFile(path.join(__dirname, 'public', 'floorplanner.html'));
});

app.get('/floorplanner-editor', (req, res) => {
  console.log("Session in /floorplanner-editor:", req.session);
  if (!req.session.passport || !req.session.passport.user) {
    return res.status(401).send('Unauthorized. Please login first.');
  }
  const authToken = req.session.passport.user.accessToken;
  if (!authToken || typeof authToken !== 'string') {
    return res.status(500).send('Invalid authentication token.');
  }
  console.log(`-------------------- ${authToken} ------------------`);
  res.render('floorplannerEditor', { authToken });  // Removed the test variable
});

app.use('/user', userRoutes);
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
