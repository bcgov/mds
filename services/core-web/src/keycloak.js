import Keycloak from "keycloak-js";
import { KEYCLOAK } from "@mds/common";

const keycloak = new Keycloak(KEYCLOAK);
export const keycloakInitConfig = {
  checkLoginIframe: false,
  pkceMethod: KEYCLOAK.pkceMethod,
  idpHint: KEYCLOAK.idir_idpHint,
};

export default keycloak;
