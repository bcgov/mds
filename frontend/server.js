const express = require("express");
const cluster = require("cluster");
const cacheControl = require("express-cache-controller");
const fs = require("fs");
const dotenv = require("dotenv").config({ path: __dirname + "/.env" });
const numCPUs = require("os").cpus().length;

let BASE_PATH = process.env.BASE_PATH;
if (dotenv.parsed) {
  BASE_PATH = dotenv.parsed.BASE_PATH;
}

const app = express();
app.use(
  cacheControl({
    noStore: true,
    private: true,
  })
);
const port = 3000;

const staticServe = express.static(`${__dirname}/build`, {
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

if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);

  // Fork workers.
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
  });
} else {
  app.listen(port, "0.0.0.0", () => console.log(`Worker ${process.pid} started`));
}
