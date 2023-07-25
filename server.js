const express = require('express');
const axios = require('axios');
const cors = require('cors');
const cookieParser = require('cookie-parser') 
const verifyToken = require('./auth');
const { OAuth2Client } = require('google-auth-library');
require('dotenv').config();

const CLIENT_ID = process.env.CLIENT_ID
const client = new OAuth2Client(CLIENT_ID);

const app = express();
app.use(express.json());
app.use(cors()); 
app.use(cookieParser());


app.post('/auth', (req, res) => {
  let token = req.body.userToken
  
  // verifying the integrity
  async function verify(){
    // console.log(token)
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID,
    });
    const payload = ticket.getPayload();
    // console.log(payload);
  }
  verify()
  .then(()=>{
    res.cookie('session-token', token);

    console.log(`Token verified + ${token}`);
    res.send('success');
  })
  .catch(console.error);
  
})



// Route for creating a new playlist
app.post('/create-playlist', verifyToken, async (req, res) => {
  try {
    // Check if the user is authenticated (has the access token in the session)
    // if (!req.isAuthenticated() || !req.user.accessToken) {
    //   return res.status(401).json({ error: 'Unauthorized' });
    // }

    const links = req.body.links;

    console.log(links)
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
          Authorization: `Bearer ${req.cookies['session-token']}`,
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
            Authorization: `Bearer ${req.cookies['session-token']}`,
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
