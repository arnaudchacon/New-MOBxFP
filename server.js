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
  callbackURL: process.env.NODE_ENV === 'production' ? 
  'https://mobilis-3207e30926a5.herokuapp.com/floorplanner/callback' : 
  'http://localhost:3000/floorplanner/callback',
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
  res.render('dashboard');
});

app.get('/test',(req, res) => {
  res.render("test",{testData: "this is a test"})
});

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
  const oauthToken = currentAccessToken;

  if (!oauthToken) {
    return res.status(400).json({ message: 'OAuth token not found.' });
  }

  try {
      const projectToken = await fetchProjectToken(req.query.projectId, oauthToken);
      return res.json({ projectToken });
  } catch (error) {
      console.error("Error fetching project token:", error.message);
      return res.status(500).json({ message: error.message });
  }
});

app.post('/create-floorplanner-project', async (req, res) => {
  const accessToken = process.env.SERVICE_ACCOUNT_TOKEN;

  if (!accessToken) {
      return res.status(401).json({ message: "Not Authenticated" });
  }

  try {
      const response = await fetch('https://floorplanner.com/api/v2/projects.json', {
          method: 'POST',
          headers: {
              'accept': 'application/json',
              'content-type': 'application/json',
              'Authorization': `Bearer ${accessToken}`
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
          const userId = 78673989;
          const templateId = 35268;
          res.render('editor', {
            projectId: data.id,
            userId: userId,
            authToken: currentAccessToken,
            templateId: templateId
          });
      }
  } catch (error) {
      console.error("Unexpected error:", error.message);
      return res.status(500).json({ message: "Internal server error" });
  }
});

app.get('/dashboard', (req, res) => {
  res.render('dashboard');
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
