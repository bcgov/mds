const express = require("express");
const cacheControl = require("express-cache-controller");
const dotenv = require("dotenv").config({ path: `${__dirname}/.env` });

let { BASE_PATH } = process.env;
let BUILD_DIR = process.env.BUILD_DIR || "../build";
const VENDOR_DIR = process.env.VENDOR_DIR || "vendor";
let PORT = process.env.PORT || 3000;
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

const vendorServe = express.static(`${__dirname}/${VENDOR_DIR}`, {
  immutable: true,
  maxAge: "1y",
});

app.get(`${BASE_PATH}/env`, (req, res) => {
  res.json({
    backend: "mds-python-backend",
    apiUrl: process.env.API_URL,
    docManUrl: process.env.DOCUMENT_MANAGER_URL,
    matomoUrl: process.env.MATOMO_URL,
    filesystemProviderUrl: process.env.FILESYSTEM_PROVIDER_URL,
    keycloak_clientId: process.env.KEYCLOAK_CLIENT_ID,
    keycloak_resource: process.env.KEYCLOAK_RESOURCE,
    keycloak_url: process.env.KEYCLOAK_URL,
    keycloak_idpHint: process.env.KEYCLOAK_IDP_HINT,
    environment: process.env.NODE_ENV,
    flagsmithKey: process.env.FLAGSMITH_KEY,
    flagsmithUrl: process.env.FLAGSMITH_URL,
  });
});

app.get(`/health`, (req, res) => {
  res.json({
    status: "pass",
  });
});

app.get(`/version`, (req, res) => {
  res.json({
    commit: process.env.COMMIT_ID || "N/A",
  });
});

app.use(`${BASE_PATH}/`, staticServe);
app.use(`${BASE_PATH}/vendor/`, vendorServe);
app.use(`${BASE_PATH}*`, staticServe);
app.use(`/`, staticServe);
app.use(`/vendor/`, staticServe);
app.use(`*`, staticServe);

app.listen(PORT, "0.0.0.0", () => console.log("Server running"));
