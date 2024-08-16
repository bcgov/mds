// eslint-disable-next-line @typescript-eslint/no-var-requires
const express = require("express");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const cacheControl = require("express-cache-controller");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const dotenv = require("dotenv").config({ path: `${__dirname}/.env` });
// eslint-disable-next-line @typescript-eslint/no-var-requires
const expressStaticGzip = require("express-static-gzip");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const helmet = require("helmet");

// Content Security Policy is managed by the environment variable CONTENT_SECURITY_POLICY defined
// in the bcgov-c/tenant-gitops-4c2ba9 repository. The value of this variable is a JSON string
let { BASE_PATH, CONTENT_SECURITY_POLICY = null, PERMISSIONS_POLICY = null } = process.env;
let BUILD_DIR = process.env.BUILD_DIR || "../build";
const VENDOR_DIR = process.env.VENDOR_DIR || "vendor";
let PORT = process.env.PORT || 3000;
if (dotenv.parsed) {
  BASE_PATH = dotenv.parsed.BASE_PATH || BASE_PATH;
  BUILD_DIR = dotenv.parsed.BUILD_DIR || BUILD_DIR;
  PORT = dotenv.parsed.PORT || PORT;
}

if (CONTENT_SECURITY_POLICY) {
  CONTENT_SECURITY_POLICY = JSON.parse(CONTENT_SECURITY_POLICY);
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

app.use(
  helmet({
    contentSecurityPolicy: CONTENT_SECURITY_POLICY
      ? {
          directives: CONTENT_SECURITY_POLICY,
        }
      : false,
  })
);

const staticServe = expressStaticGzip(`${__dirname}/${BUILD_DIR}`, {
  immutable: true,
  maxAge: "1y",
  enableBrotli: true,
  customCompressions: [
    {
      encodingName: "deflate",
      fileExtension: "zz",
    },
  ],
  orderPreference: ["br", "gzip"],
});

const vendorServe = expressStaticGzip(`${__dirname}/${VENDOR_DIR}`, {
  immutable: true,
  maxAge: "1y",
  enableBrotli: true,
  customCompressions: [
    {
      encodingName: "deflate",
      fileExtension: "zz",
    },
  ],
  orderPreference: ["br", "gzip"],
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
    syncfusionLicense: process.env.SYNCFUSION_LICENSE_KEY,
    geoMarkUrl: process.env.GEOMARK_URL_BASE,
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

app.use((req, res, next) => {
  if (PERMISSIONS_POLICY) {
    res.setHeader("Permissions-Policy", PERMISSIONS_POLICY);
  }
  next();
});

app.use(`${BASE_PATH}/`, staticServe);
app.use(`${BASE_PATH}/vendor/`, vendorServe);
app.use(`${BASE_PATH}*`, staticServe);
app.use(`/`, staticServe);
app.use(`/vendor/`, staticServe);
app.use(`*`, staticServe);

const server = app.listen(PORT, "0.0.0.0", () => console.log("Server running"));
server.keepAliveTimeout = 15 * 1000;
server.headersTimeout = 20 * 1000;
