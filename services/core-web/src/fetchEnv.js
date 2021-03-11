import axios from "axios";
import { ENVIRONMENT, KEYCLOAK, DEFAULT_ENVIRONMENT } from "@common/constants/environment";

export default function fetchEnv() {
  return new Promise((resolve, reject) => {
    ENVIRONMENT.environment = window.env.environment;
    ENVIRONMENT.apiUrl = window.env.apiUrl;
    ENVIRONMENT.docManUrl = window.env.docManUrl;
    ENVIRONMENT.firstNationsLayerUrl = window.env.firstNationsLayerUrl;
    ENVIRONMENT.filesystemProviderUrl = window.env.filesystemProviderUrl;
    ENVIRONMENT.matomoUrl = window.env.matomoUrl;
    KEYCLOAK.clientId = window.env.keycloakClientId;
    KEYCLOAK.resource = window.env.keycloakResource;
    KEYCLOAK.url = window.env.keycloakUrl;
    KEYCLOAK.idpHint = window.env.keycloakIdpHint;
    resolve();
  });
}
