import { ENVIRONMENT, DEFAULT_ENVIRONMENT, KEYCLOAK } from '@/constants/environment';

export default function fetchEnv() {
  return new Promise((resolve, reject) => {
      fetch('/env').then((res) => {
        if (!res.ok) {
            reject(res);
        }
        try {
          JSON.stringify(res.body());
          return res.json();
        } catch(err) {
          return DEFAULT_ENVIRONMENT;
        }
      }).then((env) => {
        ENVIRONMENT.apiUrl = env.apiUrl;
        KEYCLOAK.clientId = env.keycloak_clientId;
        KEYCLOAK.resource = env.keycloak_resource;
        KEYCLOAK.url = env.keycloak_url;
        resolve(env);
      });
  })
}