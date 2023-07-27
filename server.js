const express = require('express');
const axios = require('axios');
const cors = require('cors');
const cookieParser = require('cookie-parser'); 
const verifyToken = require('./auth');
const { OAuth2Client, auth } = require('google-auth-library');
require('dotenv').config();
const jwt = require('jsonwebtoken');

const CLIENT_ID = process.env.CLIENT_ID
const client = new OAuth2Client(CLIENT_ID);

const app = express();
app.use(express.json());
app.use(cors('*')); 
app.use(cookieParser());

app.get('/log', (req, res) => {

})


app.post('/auth', (req, res) => {
  let token = req.body.userToken;

  const data = jwt.decode(token);
  const email = data.email;
  console.log(email);
  const accessToken = jwt.sign({email}, process.env.ACCESS_SECRET_TOKEN);
  res.cookie('userToken', accessToken, {
    httpOnly: true,
    sameSite: 'None',
    secure: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  });
  res.json({accessToken: accessToken});
  
})

function authenticateToken(req, res, next){
  const authHeader = req.headers['authorization'];
  console.log(authHeader);

  const token = authHeader && authHeader.split(' ')[1];
  console.log(token)

  // Bearer TOKEN

  if (token==null) return res.sendStatus(401);

  jwt.verify(token, process.env.ACCESS_SECRET_TOKEN, (err, email)=> {
    if (err) return res.sendStatus(403);
    req.email = email;
    next()
  })
}



// Route for creating a new playlist
app.post('/create-playlist', authenticateToken, async (req, res) => {
    const links = req.body.links;
  })
  
    const playlistResponse = () => {
      return new Promise((resolve, reject =>{

        const data = JSON.stringify({
          part: [
            "snippet,status"
          ],
          resource: {
            snippet: {
              title: "Sample playlist created via API",
              description: "This is a sample playlist description.",
              tags: [
                "sample playlist",
                "API call"
              ],
              defaultLanguage: "en"
            },
            status: {
              privacyStatus: "unlisted"
            }
          }
        });
    
        const config = {
          method: 'post',
          maxBodyLength: Infinity,
          url: 'https://www.googleapis.com/youtube/v3/playlists',
          headers: {
            'Content-Type':'application/json',
            'Authorization':`Bearer `,
          },
          data
        }
     
    
        axios.request(config)
          .then ((response) => {
            console.log(JSON.stringify(response.data))
          })
          .catch((error)=>{
            console.log(error)
            resolve({ status: 'error', message: error })
          })

      }))
    }
    

    

    const playlistId = playlistResponse.data.id;

    // // Add videos to playlist
    // for (const videoId of videoIds) {
    //   await axios.post(
    //     'https://www.googleapis.com/youtube/v3/playlistItems',
    //     {
    //       snippet: {
    //         playlistId: playlistId,
    //         resourceId: {
    //           kind: 'youtube#video',
    //           videoId: videoId,
    //         },
    //       },
    //     },
    //     {
    //       headers: {
    //         'Content-Type': 'application/json',
    //       },
    //     }
    //   );
    // }

    // Send playlist link to frontend
  //   res.json({ playlistLink: `https://www.youtube.com/playlist?list=${playlistId}` });
  // } catch (error) {
  //   console.error('Error creating playlist:', error.message);
  //   res.status(500).json({ error: 'Error creating playlist' });
  // }


const port = 3000;
app.listen(port, () => console.log(`Server is running on port ${port}`));
