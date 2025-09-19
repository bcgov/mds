const express = require("express");
const cacheControl = require("express-cache-controller");
const dotenv = require("dotenv").config("./env");
const expressStaticGzip = require("express-static-gzip");
const helmet = require("helmet");

// Content Security Policy is managed by the environment variable CONTENT_SECURITY_POLICY defined
// in the bcgov-c/tenant-gitops-4c2ba9 repository. The value of this variable is a JSON string
let { BASE_PATH, CONTENT_SECURITY_POLICY = null, PERMISSIONS_POLICY = null } = process.env;
let BUILD_DIR = process.env.BUILD_DIR || "../build";
let PORT = process.env.PORT || 3020;
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
      : {
          directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"], // Note: unsafe-inline should be removed when proper nonces are implemented
            styleSrc: ["'self'", "'unsafe-inline'"], // Note: unsafe-inline should be removed when proper nonces are implemented
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
          },
        },
    crossOriginEmbedderPolicy: { policy: "require-corp" },
    crossOriginOpenerPolicy: { policy: "same-origin" },
    crossOriginResourcePolicy: { policy: "same-origin" },
  })
);

const staticServe = expressStaticGzip(`${__dirname}/${BUILD_DIR}`, {
  enableBrotli: true,
  maxAge: "1y",
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
    matomoUrl: process.env.MATOMO_URL || "",
    filesystemProviderUrl: process.env.FILESYSTEM_PROVIDER_URL,
    keycloak_resource: process.env.KEYCLOAK_RESOURCE,
    keycloak_clientId: process.env.KEYCLOAK_CLIENT_ID,
    keycloak_url: process.env.KEYCLOAK_URL,
    keycloak_idir_idpHint: process.env.KEYCLOAK_IDP_HINT,
    keycloak_bceid_idpHint: process.env.KEYCLOAK_IDP_HINT,
    keycloak_vcauthn_idpHint: process.env.KEYCLOAK_IDP_HINT,
    siteminder_url: process.env.SITEMINDER_URL,
    environment: process.env.NODE_ENV,
    vcauthn_pres_req_conf_id: process.env.VCAUTHN_PRES_REQ_CONF_ID,
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

// Explicit robots.txt endpoint with proper security headers
app.get('/robots.txt', (req, res) => {
  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.send('User-agent: *\nDisallow: /');
});

// Explicit sitemap.xml endpoint with proper security headers
app.get('/sitemap.xml', (req, res) => {
  res.setHeader('Content-Type', 'application/xml');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.send('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n</urlset>');
});

// Handle trailing slash redirects for robots.txt and sitemap.xml
app.get('/robots.txt/', (req, res) => {
  res.redirect(301, '/robots.txt');
});

app.get('/sitemap.xml/', (req, res) => {
  res.redirect(301, '/sitemap.xml');
});

app.use((req, res, next) => {
  if (PERMISSIONS_POLICY) {
    res.setHeader("Permissions-Policy", PERMISSIONS_POLICY);
  }
  
  // Additional security headers to address ZAP scan issues
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  next();
});

app.use(`${BASE_PATH}/`, staticServe);
app.use(`${BASE_PATH}*`, staticServe);
app.use(`/`, staticServe);
app.use(`*`, staticServe);

const server = app.listen(PORT, "0.0.0.0", () => console.log("Server running"));
server.keepAliveTimeout = 15 * 1000;
server.headersTimeout = 20 * 1000;
