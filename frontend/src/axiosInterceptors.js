import axios from "axios";

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    const { status } = error.response;
    if (status === 401 || status === 503) {
      window.location.reload(false);
    }
    return Promise.reject(error);
  }
);
