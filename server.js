require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const session = require('express-session');
const passport = require('passport');
const OAuth2Strategy = require('passport-oauth2');
const fetch = require('node-fetch');
const app = express();
const PORT = process.env.PORT || 3000;
const db = require('./config/database');
const userRoutes = require('./routes/userRoutes');
const projectRoutes = require('./routes/projectRoutes');
let currentAccessToken = null;

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

// Routes
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
    
    // Store the access token in the global variable
    currentAccessToken = req.session.passport.user.accessToken;

    res.redirect('/dashboard');  // Redirect to dashboard after successful authentication
  }
);

app.get('/fetch-project-token', async (req, res) => {
  const oauthToken = currentAccessToken;  // Use the stored access token

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

app.post('/create-floorplanner-project', async (req, res) => {
  // Use the stored access token
  const accessToken = currentAccessToken;

  if (!accessToken) {
      return res.status(401).json({ message: "Not Authenticated" });
  }

  try {
      // Create a new project on Floorplanner
      const response = await fetch('https://floorplanner.com/api/v2/projects.json', {
          method: 'POST',
          headers: {
              'accept': 'application/json',
              'content-type': 'application/json',
              'Authorization': `Bearer ${accessToken}`  // Use Bearer token for authorization
          },
          body: JSON.stringify({
              project: {
                  name: req.body.name,
                  description: req.body.description
              }
          })
      });

      const data = await response.json();

      if (!response.ok) {
          console.error("Error creating project:", data);
          return res.status(response.status).json(data);
      } else {
          // Fetch project-specific token for the created project
          const projectTokenResponse = await fetch(`https://floorplanner.com/api/v2/projects/${data.id}/token.json`, {
              method: 'GET',
              headers: {
                  'Authorization': `Bearer ${accessToken}`,
                  'Accept': 'application/json'
              }
          });

          const projectTokenData = await projectTokenResponse.json();
          if (!projectTokenData.token) {
              throw new Error('Failed to fetch project token from Floorplanner');
          }

          // Redirect to the Floorplanner editor with the new project ID and token
          return res.json({ 
            editorUrl: `/floorplanner-editor?projectId=${data.id}&projectToken=${projectTokenData.token}`
          });
      }
  } catch (error) {
      console.error("Unexpected error:", error.message);
      return res.status(500).json({ message: "Internal server error" });
  }
});


app.get('/floorplanner', (req, res) => {
  console.log("Session in /floorplanner:", req.session);
  
  // Use the stored access token
  const authToken = currentAccessToken;

  if (!authToken) {
    return res.redirect('/auth/provider');
  }

  res.sendFile(path.join(__dirname, 'public', 'floorplanner.html'));
});

app.get('/dashboard', (req, res) => {
  res.render('dashboard');
});

app.get('/floorplanner-editor', (req, res) => {
  console.log("Session in /floorplanner-editor:", req.session);
  
  // Use the stored access token
  const authToken = currentAccessToken;

  if (!authToken || typeof authToken !== 'string') {
      return res.status(500).send('Invalid authentication token.');
  }
  const projectId = req.query.projectId;  // Get the project ID from the query parameter
  if (!projectId) {
      return res.status(400).send('Project ID is required.');
  }
  console.log(`-------------------- ${authToken} ------------------`);
  res.render('floorplannerEditor', { authToken, projectId });
});

app.use('/user', userRoutes);
app.use('/project', projectRoutes);

// Error Handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

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
