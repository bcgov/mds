import { ENVIRONMENT, DEFAULT_ENVIRONMENT, KEYCLOAK, USER_ROLES } from "@/constants/environment";
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
      ENVIRONMENT.mapPortalId = env.mapPortalId;
      KEYCLOAK.clientId = env.keycloak_clientId;
      KEYCLOAK.resource = env.keycloak_resource;
      KEYCLOAK.url = env.keycloak_url;
      KEYCLOAK.idpHint = env.keycloak_idpHint;
      USER_ROLES.role_admin = env.keycloak_role_admin;
      USER_ROLES.role_create = env.keycloak_role_create;
      USER_ROLES.role_view = env.keycloak_role_view;
      ENVIRONMENT.environment = env.environment;
    });
}
