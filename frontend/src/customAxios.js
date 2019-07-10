import axios from "axios";
import { notification } from "antd";
import { isEmpty } from "lodash";
import * as String from "@/constants/strings";
import { store } from "@/App";

const UNAUTHORIZED = 401;
const MAINTENANCE = 503;

const CustomAxios = ({ errorToastMessage, selector } = {}) => {
  const instance = axios.create();

  instance.interceptors.request.use((config) => {
    console.log("config", config);

    if (selector !== undefined) {
      const state = store.getState();
      console.log("state", state);
      const storedValue = selector(state);
      console.log("storedValue", storedValue);

      if (!isEmpty(storedValue)) {
        throw new axios.Cancel({ data: storedValue });
      }
    }

    return config;
  });

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (axios.isCancel(error)) {
        console.log("Request cancelled", error.message);
        return Promise.resolve(error.message);
      }

      const status = error.response ? error.response.status : null;
      if (status === UNAUTHORIZED || status === MAINTENANCE) {
        window.location.reload(false);
      } else if (errorToastMessage === "default" || errorToastMessage === undefined) {
        notification.error({
          message: error.response ? error.response.data.message : String.ERROR,
          duration: 10,
        });
      } else if (errorToastMessage) {
        notification.error({
          message: errorToastMessage,
          duration: 10,
        });
      }

      return Promise.reject(error);
    }
  );

  return instance;
};

export default CustomAxios;
