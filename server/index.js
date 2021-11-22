const express = require('express');
const OAuth2JWTBearer = require('express-oauth2-jwt-bearer');

const authConfig = require('./auth-config.json');

const app = express();

// serve the auth config publicly
app.get('/auth-config', (req, res) => {
  res.json(authConfig);
});

// create the auth middleware
const checkJwt = OAuth2JWTBearer.auth({
  audience: authConfig.audience,
  issuerBaseURL: `https://${authConfig.domain}`,
});

// return 'Not authorized' if we don't have a user
app.use('/api', checkJwt, (err, req, res, next) => {
  if (err.name === 'UnauthorizedError') {
    return res.sendStatus(401);
  } else {
    next(err);
  }
});

app.get('/api/hello', (req, res) => {
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
