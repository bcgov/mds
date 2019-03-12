import axios from "axios";

const UNAUTHORIZED = 401
const MAINTENANCE = 503

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    const { status } = error.response;
    if (status === UNAUTHORIZED || status === MAINTENANCE) {
      window.location.reload(false);
    }
    return Promise.reject(error);
  }
);
