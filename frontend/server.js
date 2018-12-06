const express = require("express");
const fs = require("fs");
const dotenv = require("dotenv").config({ path: __dirname + "/.env" });

let BASE_PATH = process.env.BASE_PATH;
if (dotenv.parsed) {
  BASE_PATH = dotenv.parsed.BASE_PATH;
}

const app = express();
const port = 3000;
const commonHeaders = {
  "Cache-Control": "private, no-cache, no-store",
  Pragma: "no-cache",
  Expires: 0,
  "X-XSS-Protection": 1,
  "X-Frame-Options": "SAMEORIGIN",
};

const staticServe = express.static(`${__dirname}/build`, {
  immutable: true,
  maxAge: "1y",
  setHeaders: function(res, path, stat) {
    res.set(commonHeaders);
  },
});

const serveGzipped = (contentType) => (req, res, next) => {
  const acceptedEncodings = req.acceptsEncodings();
  if (acceptedEncodings.indexOf("gzip") === -1 || !fs.existsSync(`./build/${req.url}.gz`)) {
    next();
    return;
  }

  // update request's url
  req.url = `${req.url}.gz`;

  // set correct headers
  res.set(commonHeaders);
  res.set("Content-Encoding", "gzip");
  res.set("Content-Type", contentType);

  // let express.static take care of the updated request
  next();
};

app.get(`${BASE_PATH}/env`, function(req, res) {
  res.set(commonHeaders);
  res.json({
    backend: "mds-python-backend",
    apiUrl: process.env.API_URL,
    keycloak_resource: process.env.KEYCLOAK_RESOURCE,
    keycloak_clientId: process.env.KEYCLOAK_CLIENT_ID,
    keycloak_url: process.env.KEYCLOAK_URL,
    keycloak_idpHint: process.env.KEYCLOAK_IDP_HINT,
    keycloak_role_admin: process.env.KEYCLOAK_ROLE_ADMIN,
    keycloak_role_create: process.env.KEYCLOAK_ROLE_CREATE,
    keycloak_role_view: process.env.KEYCLOAK_ROLE_VIEW,
  });
});

app.get(`${BASE_PATH}/*.js`, serveGzipped("text/javascript"));
app.get(`${BASE_PATH}/*.css`, serveGzipped("text/css"));

app.use(`${BASE_PATH}/`, staticServe);
app.use(`${BASE_PATH}*`, staticServe);
app.use(`/`, staticServe);
app.use(`*`, staticServe);

app.listen(port, "0.0.0.0", () => console.log("Server running"));
