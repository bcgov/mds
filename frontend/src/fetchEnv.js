import { ENVIRONMENT, DEFAULT_ENVIRONMENT } from './constants/API'

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
        if (env.apiUrl) {
            ENVIRONMENT.apiUrl = env.apiUrl
        }
        resolve(env);
      });
  })
}