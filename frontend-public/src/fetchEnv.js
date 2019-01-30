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
    .catch(() => DEFAULT_ENVIRONMENT)
    .then((env) => {
      ENVIRONMENT.apiUrl = env.apiUrl;
      KEYCLOAK.clientId = env.keycloak_clientId;
      KEYCLOAK.resource = env.keycloak_resource;
      KEYCLOAK.siteMinderLogoutURL = `${env.siteminder_url}/clp-cgi/logoff.cgi?returl=`;
      KEYCLOAK.loginURL = `${
        env.keycloak_url
      }/auth/realms/mds/protocol/openid-connect/auth?response_type=code&client_id=${
        env.keycloak_clientId
      }&redirect_uri=`;
      KEYCLOAK.keycloakLogoutURL = `${
        env.keycloak_url
      }/auth/realms/mds/protocol/openid-connect/logout?redirect_uri=`;
      KEYCLOAK.tokenURL = `${env.keycloak_url}/auth/realms/mds/protocol/openid-connect/token`;
      KEYCLOAK.userInfoURL = `${env.keycloak_url}/auth/realms/mds/protocol/openid-connect/userinfo`;
    });
}
