const express = require("express");
const cacheControl = require("express-cache-controller");
const dotenv = require("dotenv").config({ path: `${__dirname}/.env` });

let BASE_PATH = process.env.BASE_PATH;
let BUILD_DIR = process.env.BUILD_DIR || "build";
let PORT = process.env.PORT || 3020;
if (dotenv.parsed) {
  BASE_PATH = dotenv.parsed.BASE_PATH || BASE_PATH;
  BUILD_DIR = dotenv.parsed.BUILD_DIR || BUILD_DIR;
  PORT = dotenv.parsed.PORT || PORT;
}

// maxAge and mustRevalidate control how the client caches application files. The settings
// below allows the client to cache content, but the client must check to see if the content
// is stale. Our app serves content with eTags, so this results in a status 304 Not Modified
// response, unless the content has been updated.
const app = express();
app.use(
  cacheControl({
    mustRevalidate: true,
    maxAge: 0,
    private: true,
  })
);

const staticServe = express.static(`${__dirname}/${BUILD_DIR}`, {
  immutable: true,
  maxAge: "1y",
});

app.get(`${BASE_PATH}/env`, (req, res) => {
  res.json({
    backend: "mds-python-backend",
    apiUrl: process.env.API_URL,
    keycloak_resource: process.env.KEYCLOAK_RESOURCE,
    keycloak_clientId: process.env.KEYCLOAK_CLIENT_ID,
    keycloak_idpHint: process.env.KEYCLOAK_IDP_HINT,
    keycloak_url: process.env.KEYCLOAK_URL,
    siteminder_url: process.env.SITEMINDER_URL,
  });
});

app.use(`${BASE_PATH}/`, staticServe);
app.use(`${BASE_PATH}*`, staticServe);
app.use(`/`, staticServe);
app.use(`*`, staticServe);

app.listen(PORT, "0.0.0.0", () => console.log("Server running"));
