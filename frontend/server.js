const express = require("express");
const cacheControl = require("express-cache-controller");
const dotenv = require("dotenv").config({ path: `${__dirname}/.env` });
const jwt = require("jsonwebtoken");

const { METABASE_SITE_URL, METABASE_SECRET_KEY } = process.env;
let { BASE_PATH } = process.env;
let BUILD_DIR = process.env.BUILD_DIR || "build";
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

app.get(`${BASE_PATH}/env`, (req, res) => {
  res.json({
    backend: "mds-python-backend",
    apiUrl: process.env.API_URL,
    mapPortalId: process.env.MAP_PORTAL_ID,
    keycloak_resource: process.env.KEYCLOAK_RESOURCE,
    keycloak_clientId: process.env.KEYCLOAK_CLIENT_ID,
    keycloak_url: process.env.KEYCLOAK_URL,
    keycloak_idpHint: process.env.KEYCLOAK_IDP_HINT,
    keycloak_role_admin: process.env.KEYCLOAK_ROLE_ADMIN,
    keycloak_role_create: process.env.KEYCLOAK_ROLE_CREATE,
    keycloak_role_view: process.env.KEYCLOAK_ROLE_VIEW,
    environment: process.env.NODE_ENV,
  });
});

app.get(`${BASE_PATH}/metabase-token`, async (req, res) => {
  // TODO: check user's auth token is valid instead of this string
  if (req.header("Authorization") !== "authtoken") {
    const reason = "Invalid Authorization header";
    res.send({ status: 401, status_message: "Unauthorized", message: reason });
  }
  const payload = {
    resource: { dashboard: 136 },
    params: {},
  };
  const token = jwt.sign(payload, METABASE_SECRET_KEY);
  const dashboardUrl = `${METABASE_SITE_URL}/embed/dashboard/${token}`;
  res.json({ dashboardUrl });
});

app.use(`${BASE_PATH}/`, staticServe);
app.use(`${BASE_PATH}*`, staticServe);
app.use(`/`, staticServe);
app.use(`*`, staticServe);

app.listen(PORT, "0.0.0.0", () => console.log("Server running"));
