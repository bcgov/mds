import { ENVIRONMENT } from './constants/API'

export default function fetchEnv() {
  return new Promise((resolve, reject) => {
      fetch('/env').then((res) => {
        if (!res.ok) {
            reject(res);
        }
        return res.json();
      }).then((env) => {
        if (env.apiUrl) {
            ENVIRONMENT.apiUrl = env.apiUrl
        }
        resolve(env);
      });
  })
}