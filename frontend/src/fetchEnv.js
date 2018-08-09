import { environment } from './constants/API'

export default function fetchEnv() {
    fetch('/env').then((res) => {
        if (!res.ok) {
            return Promise.reject(res);
        } 
        return res.json();
    }).then((env) => {
        if (env.apiUrl) {
            environment.apiUrl = env.apiUrl
        }
    });
}