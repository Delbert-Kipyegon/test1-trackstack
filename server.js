// app.js

const express = require('express');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const axios = require('axios');
require('dotenv').config();
const cors = require('cors'); 

const app = express();
app.use(session({ secret: 'your_session_secret_here', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());
app.use(cors()); 

// Replace these with your credentials from Google Developers Console
const GOOGLE_CLIENT_ID = process.env.CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.CLIENT_SECRET;
const YOUTUBE_API_KEY = process.env.API_KEY;

// Passport serialization/deserialization
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

// Passport Google Strategy configuration
passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: '/auth/callback',
    },
    (accessToken, refreshToken, profile, done) => {
      // Save the access token in the user session for future API requests
      profile.accessToken = accessToken;
      return done(null, profile);
    }
  )
);

// Auth route to initiate the OAuth 2.0 flow
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'delbertkip@gmail.com', 'https://www.googleapis.com/auth/youtube.force-ssl'] }));

// Callback route to handle the OAuth 2.0 callback
app.get('/auth/callback', passport.authenticate('google', { failureRedirect: '/' }), (req, res) => {
  // Redirect to the main page or the page where the user can create playlists
  res.redirect('/create-playlist');
  console.log("Test 2")
});

// Route for creating a new playlist
app.post('/create-playlist', async (req, res) => {
  try {
    // Check if the user is authenticated (has the access token in the session)
    if (!req.isAuthenticated() || !req.user.accessToken) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const links = req.body.links;
    // Extract video IDs from links
    const videoIds = links.map(link => new URL(link).searchParams.get('v'));

    // Create a new playlist
    const playlistResponse = await axios.post(
      'https://www.googleapis.com/youtube/v3/playlists',
      {
        snippet: {
          title: 'My Playlist',
          description: 'This is my playlist description',
        },
        status: {
          privacyStatus: 'unlisted',
        },
      },
      {
        headers: {
          Authorization: `Bearer ${req.user.accessToken}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      }
    );

    const playlistId = playlistResponse.data.id;

    // Add videos to playlist
    for (const videoId of videoIds) {
      await axios.post(
        'https://www.googleapis.com/youtube/v3/playlistItems',
        {
          snippet: {
            playlistId: playlistId,
            resourceId: {
              kind: 'youtube#video',
              videoId: videoId,
            },
          },
        },
        {
          headers: {
            Authorization: `Bearer ${req.user.accessToken}`,
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Send playlist link to frontend
    res.json({ playlistLink: `https://www.youtube.com/playlist?list=${playlistId}` });
  } catch (error) {
    console.error('Error creating playlist:', error.message);
    res.status(500).json({ error: 'Error creating playlist' });
  }
});

const port = 3000;
app.listen(port, () => console.log(`Server is running on port ${port}`));
