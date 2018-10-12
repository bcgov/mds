import { ENVIRONMENT, DEFAULT_ENVIRONMENT, KEYCLOAK, USER_ROLES } from '@/constants/environment';
import axios from 'axios';

export default function fetchEnv() {
  return axios.get(`${process.env.BASE_PATH}/env`)
    .then(function (res) {
      try {
          JSON.stringify(res.data);
          return res.data;
        } catch(err) {
          return DEFAULT_ENVIRONMENT;
      }

    })
    .catch(function (error) {
        return DEFAULT_ENVIRONMENT;
    })
    .then(function (env) {
        ENVIRONMENT.apiUrl = env.apiUrl;
        KEYCLOAK.clientId = env.keycloak_clientId;
        KEYCLOAK.resource = env.keycloak_resource;
        KEYCLOAK.url = env.keycloak_url;
        USER_ROLES.role_admin = env.keycloak_role_admin;
        USER_ROLES.role_create = env.keycloak_role_create;
        USER_ROLES.role_view = env.keycloak_role_view;
  });
}