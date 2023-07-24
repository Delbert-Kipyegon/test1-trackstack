const { google } = require('googleapis');
require('dotenv').config();

const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URL // Specify your redirect_uri; you must add this to your Google API console project
);

const API_K = process.env.API_KEY;

const config = {
  method: 'post',
  maxBodyLength: Infinity,
  url: 'https://www.googleapis.com/auth/youtube.force-ssl',
  headers: {
    'Content-Type':'application/json',
    'Authorization': `Bearer ${API_K}`,

  }
}

const authenticateWithYouTubeAPI = async () => {
  const authorizeUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: 'https://www.googleapis.com/auth/youtube.force-ssl' // Ensure you have the right scopes
  });

  console.log(`Please visit this URL to authorize the application: ${authorizeUrl}`);

  // Your code should pause execution and wait for the user to visit the authorize URL. 
  // After they've authorized the app and received their code, they should paste it into the application. 
  // This might involve creating a simple form on your webpage where the user can paste the code, then 
  // sending it to your server with a POST request.
  //
  // For demonstration purposes, we'll just use a hardcoded code.

  const code = "PASTE_THE_CODE_HERE";

  const { tokens } = await oauth2Client.getToken(code);

  // Now tokens contains the access_token and optionally refresh_token. Store these somewhere safe
  return tokens.access_token;
};


module.exports = {
    authenticateWithYouTubeAPI
}