import axios from "axios";
import { ENVIRONMENT, KEYCLOAK } from "@common/constants/environment";
import { DEFAULT_ENVIRONMENT } from "@/constants/environment";

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
      ENVIRONMENT.matomoUrl = env.matomoUrl;
      ENVIRONMENT.environment = env.environment;
      KEYCLOAK.clientId = env.keycloak_clientId;
      KEYCLOAK.idpHint = env.keycloak_idpHint;
      KEYCLOAK.resource = env.keycloak_resource;
      KEYCLOAK.siteMinderLogoutURL = `${env.siteminder_url}/clp-cgi/logoff.cgi?returl=`;
      KEYCLOAK.loginURL = `${env.keycloak_url}/realms/mds/protocol/openid-connect/auth?response_type=code&client_id=${env.keycloak_clientId}&redirect_uri=`;
      KEYCLOAK.keycloakLogoutURL = `${env.keycloak_url}/realms/mds/protocol/openid-connect/logout?redirect_uri=`;
      KEYCLOAK.tokenURL = `${env.keycloak_url}/realms/mds/protocol/openid-connect/token`;
      KEYCLOAK.userInfoURL = `${env.keycloak_url}/realms/mds/protocol/openid-connect/userinfo`;
    });
}
