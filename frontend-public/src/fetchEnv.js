import { ENVIRONMENT, DEFAULT_ENVIRONMENT, KEYCLOAK } from "@/constants/environment";
import axios from "axios";

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
    .catch((error) => DEFAULT_ENVIRONMENT)
    .then((env) => {
      ENVIRONMENT.apiUrl = env.apiUrl;
      KEYCLOAK.clientId = env.keycloak_clientId;
      KEYCLOAK.resource = env.keycloak_resource;
      KEYCLOAK.url = env.keycloak_url;
      KEYCLOAK.idpHint = env.keycloak_idpHint;
    });
}
