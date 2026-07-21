import Keycloak from "keycloak-js";
import { KEYCLOAK } from "@mds/common/constants/environment";

const keycloak = new Keycloak(KEYCLOAK);
export const keycloakInitConfig = {
  pkceMethod: KEYCLOAK.pkceMethod,
  // Perform a silent sso check to determine whether the user is logged in or not.
  // https://www.keycloak.org/docs/latest/securing_apps/index.html#using-the-adapter
  // NOTE: idpHint is intentionally NOT set here. If it is passed to init(), keycloak-js
  // also applies it to the silent check-sso iframe, which then redirects to the IDP's
  // real login page (test.loginproxy.gov.bc.ca) instead of silently redirecting back.
  // That page's CSP ("frame-ancestors 'self'") then blocks the iframe and logs a CSP
  // error in the console. Pass idpHint explicitly on the actual keycloak.login() call
  // instead (see AuthenticationGuard).
  onLoad: "check-sso",
  silentCheckSsoRedirectUri: `${location.origin}${process.env.NODE_ENV === "development" ? "/" : "/public/"
    }silent-check-sso.html`,
  // keycloak-js also polls a hidden iframe (login-status-iframe.html on the Keycloak
  // server) every few seconds to detect session changes in other tabs. BC Gov's
  // loginproxy sets "frame-ancestors 'self'" on all responses, so that iframe is always
  // blocked by the browser and logs a recurring CSP error, even though it has nothing to
  // do with idpHint/check-sso. Disable it since it can never succeed cross-origin here;
  // token refresh (updateToken) still runs independently of this check.
  checkLoginIframe: false,
};

export default keycloak;
