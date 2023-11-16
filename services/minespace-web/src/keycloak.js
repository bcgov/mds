import Keycloak from "keycloak-js";
import { KEYCLOAK } from "@mds/common";

const keycloak = new Keycloak(KEYCLOAK);
export const keycloakInitConfig = {
  pkceMethod: KEYCLOAK.pkceMethod,

  // Perform a silent sso check to determine whether the user is logged in or not.
  // https://www.keycloak.org/docs/latest/securing_apps/index.html#using-the-adapter
  onLoad: "check-sso",
  silentCheckSsoRedirectUri: `${location.origin}${
    process.env.NODE_ENV === "development" ? "/" : "/public/"
  }silent-check-sso.html`,
};

export default keycloak;
