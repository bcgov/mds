const express = require('express');
const fs = require('fs');
const dotenv = require('dotenv').config({ path: __dirname + '/.env' });

const app = express();
const port = 3000;
const commonHeaders = {
    'Cache-Control': 'private, no-cache, no-store',
    'Pragma': 'no-cache',
    'Expires': 0,
    'X-XSS-Protection': 1,
    'X-Frame-Options': 'SAMEORIGIN',
};

const staticServe = express.static(`${__dirname}/build`, {
  immutable: true,
  maxAge: '1y',
  setHeaders: function (res, path, stat) {
        res.set(commonHeaders);
    }
});

const serveGzipped = (contentType) => (req, res, next) => {
  const acceptedEncodings = req.acceptsEncodings();
  if (acceptedEncodings.indexOf('gzip') === -1 || !fs.existsSync(`./build/${req.url}.gz`)) {
    next();
    return;
  }

  // update request's url
  req.url = `${req.url}.gz`;

  // set correct headers
  res.set(commonHeaders);
  res.set('Content-Encoding', 'gzip');
  res.set('Content-Type', contentType);


  // let express.static take care of the updated request
  next();
}

app.get("/env", function(req, res) {
  res.set(commonHeaders);
  res.json({
      backend: 'mds-python-backend',
      apiUrl: `${process.env.API_URL}`,
      keycloak_resource: `${process.env.KEYCLOAK_RESOURCE}`,
      keycloak_clientId: `${process.env.KEYCLOAK_CLIENT_ID}`,
      keycloak_url: `${process.env.KEYCLOAK_URL}`
  });
});

app.get('*.js', serveGzipped('text/javascript'));
app.get('*.css', serveGzipped('text/css'));

app.get('/service-worker.js', (req, res) => {
  res.set(commonHeaders);
  res.set({ 'Content-Type': 'application/javascript; charset=utf-8' });
  res.send(fs.readFileSync('build/service-worker.js'));
});

app.use('/', staticServe);
app.use('*', staticServe);

app.listen(port, '0.0.0.0', () => console.log('Server running'));
