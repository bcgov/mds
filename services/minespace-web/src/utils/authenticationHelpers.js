import { KEYCLOAK } from "@mds/common";
import {
  KEYCLOAK_LOGOUT_REDIRECT_URI,
  SITEMINDER_LOGOUT_REDIRECT_URI,
} from "@/constants/environment";

export const signOutFromSSO = () => {
  window.open(`${KEYCLOAK.keycloakLogoutURL}${KEYCLOAK_LOGOUT_REDIRECT_URI}`, "_self");
};

export const signOutFromSiteMinder = () => {
  window.open(`${KEYCLOAK.siteMinderLogoutURL}${SITEMINDER_LOGOUT_REDIRECT_URI}`, "_self");
};
