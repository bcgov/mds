import * as ENV from "@/constants/environment";

export const signOutFromSSO = () => {
  window.open(`${ENV.KEYCLOAK.keycloakLogoutURL}${ENV.KEYCLOAK_LOGOUT_REDIRECT_URI}`, "_self");
};

export const signOutFromSiteMinder = () => {
  window.open(`${ENV.KEYCLOAK.siteMinderLogoutURL}${ENV.SITEMINDER_LOGOUT_REDIRECT_URI}`, "_self");
};
