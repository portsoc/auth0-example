const express = require('express');
const authConfig = require('./auth-config.json');

const app = express();

// serve the auth config publicly
app.get('/auth-config', (req, res) => {
  res.json(authConfig);
});

// this will serve the files present in static/
app.use(express.static('static'));

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
