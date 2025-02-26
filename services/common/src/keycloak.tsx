import Keycloak from "keycloak-js";
import { KEYCLOAK } from "@mds/common/constants/environment";

let kc: Keycloak;
const getKeycloak = () => {
  kc = kc ?? new Keycloak(KEYCLOAK);
  return kc;
};

export const keycloakInitConfig = {
  pkceMethod: KEYCLOAK.pkceMethod,
  idpHint: KEYCLOAK.idir_idpHint,
  // Perform a silent sso check to determine whether the user is logged in or not.
  // https://www.keycloak.org/docs/latest/securing_apps/index.html#using-the-adapter
  onLoad: "check-sso",
  silentCheckSsoRedirectUri: `${location.origin}${process.env.NODE_ENV === "development" ? "/" : "/public/"
    }silent-check-sso.html`,
};

const keycloak = getKeycloak();
export default keycloak;