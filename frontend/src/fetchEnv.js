import { ENVIRONMENT, DEFAULT_ENVIRONMENT, KEYCLOAK } from '@/constants/environment';
import axios from 'axios';

export default function fetchEnv() {
  return axios.get('/env')
    .then(function (res) {
      try {
      console.log(res);
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
  });
}