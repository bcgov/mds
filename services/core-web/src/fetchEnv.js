import axios from "axios";
import { ENVIRONMENT, DEFAULT_ENVIRONMENT, KEYCLOAK } from "@mds/common";

export default function fetchEnv() {
  return axios
    .get(`${process.env.BASE_PATH}/env`)
    .then((res) => {
      try {
        JSON.stringify(res.data);
        return res.data;
      } catch (err) {
        return DEFAULT_ENVIRONMENT;
      }
    })
    .catch(() => DEFAULT_ENVIRONMENT)
    .then((env) => {
      ENVIRONMENT.apiUrl = env.apiUrl;
      ENVIRONMENT.docManUrl = env.docManUrl;
      ENVIRONMENT.firstNationsLayerUrl = env.firstNationsLayerUrl;
      ENVIRONMENT.filesystemProviderUrl = env.filesystemProviderUrl;
      ENVIRONMENT.matomoUrl = env.matomoUrl;
      KEYCLOAK.clientId = env.keycloak_clientId;
      KEYCLOAK.resource = env.keycloak_resource;
      KEYCLOAK.url = env.keycloak_url;
      KEYCLOAK.idir_idpHint = env.keycloak_idir_idpHint;
      KEYCLOAK.bceid_idpHint = env.keycloak_bceid_idpHint;
      KEYCLOAK.vcauthn_idpHint = env.keycloak_vcauthn_idpHint;
      ENVIRONMENT.environment = env.environment;
    });
}
