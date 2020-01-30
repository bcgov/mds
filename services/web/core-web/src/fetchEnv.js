import axios from "axios";
import { ENVIRONMENT, DEFAULT_ENVIRONMENT, KEYCLOAK } from "@common/constants/environment";

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
      KEYCLOAK.clientId = env.keycloak_clientId;
      KEYCLOAK.resource = env.keycloak_resource;
      KEYCLOAK.url = env.keycloak_url;
      KEYCLOAK.idpHint = env.keycloak_idpHint;
      ENVIRONMENT.environment = env.environment;
    });
}
