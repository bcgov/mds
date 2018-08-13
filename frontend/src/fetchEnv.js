import { ENVIRONMENT } from './constants/API'

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
          return {apiUrl: "http://localhost:5000"};
        }
      }).then((env) => {
        if (env.apiUrl) {
            ENVIRONMENT.apiUrl = env.apiUrl
        }
        resolve(env);
      });
  })
}