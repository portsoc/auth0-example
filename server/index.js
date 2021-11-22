import express from 'express';

import authConfig from './auth-config.js';
import * as auth0 from './auth0-helpers.js';

const app = express();

// serve the auth config publicly
app.get('/auth-config', (req, res) => {
  res.json(authConfig);
});

// protect /api from unauthenticated users
app.use('/api', auth0.checkJwt(authConfig));

app.get('/api/hello', auth0.getProfile, (req, res) => {
  console.log(req.user);

  const userId = req.auth.payload.sub;
  res.send(`Hello user ${userId}!`);

  console.log('successful authenticated request by ' + userId);
});

// this will serve the files present in static/
app.use(express.static('static'));

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
