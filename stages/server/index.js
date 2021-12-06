import express from 'express';
import path from 'path';
import url from 'url';

import authConfig from './auth-config.js';

const app = express();

// serve the auth config publicly
app.get('/auth-config', (req, res) => {
  res.json(authConfig);
});

// a simple API route that will greet anyone
app.get('/api/hello', (req, res) => {
  res.send(`Hello! The time is ${new Date()}`);
});

// this will serve the files present in static/ inside this stage
app.use(express.static(path.join(path.dirname(url.fileURLToPath(import.meta.url)), '../static')));

// start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
