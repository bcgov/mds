const express = require("express");
const cacheControl = require("express-cache-controller");
const dotenv = require("dotenv").config({ path: __dirname + "/.env" });

let BASE_PATH = process.env.BASE_PATH;
let BUILD_DIR = process.env.BUILD_DIR || "build";
if (dotenv.parsed) {
  BASE_PATH = dotenv.parsed.BASE_PATH || BASE_PATH;
  BUILD_DIR = dotenv.parsed.BUILD_DIR || BUILD_DIR;
}

const app = express();
app.use(
  cacheControl({
    noStore: true,
    private: true,
  })
);
const port = 3000;

const staticServe = express.static(`${__dirname}/${BUILD_DIR}`, {
  immutable: true,
  maxAge: "1y",
});

app.get(`${BASE_PATH}/env`, function(req, res) {
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
  });
});

app.use(`${BASE_PATH}/`, staticServe);
app.use(`${BASE_PATH}*`, staticServe);
app.use(`/`, staticServe);
app.use(`*`, staticServe);

app.listen(port, "0.0.0.0", () => console.log("Server running"));
