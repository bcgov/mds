import Keycloak from 'keycloak-js';
import { KEYCLOAK } from "@mds/common";

const keycloak = new Keycloak(KEYCLOAK);

export const keycloakInitConfig = {
    pkceMethod: KEYCLOAK.pkceMethod,
    checkLoginIframe: false,
}

export default keycloak;