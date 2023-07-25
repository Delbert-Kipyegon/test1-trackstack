const { OAuth2Client } = require('google-auth-library');
require('dotenv').config();

const CLIENT_ID = process.env.CLIENT_ID
const client = new OAuth2Client(CLIENT_ID);

const verifyToken = async (req, res, next) => {
  const token = req.cookies['session-token'];

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID,
    });
    const payload = ticket.getPayload();
    // Optionally, you can attach the payload to the request object for further use in the route handler
    req.user = payload;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = verifyToken;
