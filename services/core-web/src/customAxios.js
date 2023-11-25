import axios from "axios";
import { notification } from "antd";
import { isEmpty } from "lodash";
import * as String from "@mds/common/constants/strings";
import { store } from "@/App";

// https://stackoverflow.com/questions/39696007/axios-with-promise-prototype-finally-doesnt-work
const promiseFinally = require("promise.prototype.finally");

promiseFinally.shim();

const UNAUTHORIZED = 401;
const MAINTENANCE = 503;

const defaultEnvelope = (x) => ({ data: { records: x } });

const CustomAxios = ({ errorToastMessage, selector, envelope = defaultEnvelope } = {}) => {
  const instance = axios.create();

  instance.interceptors.request.use((config) => {
    if (selector !== undefined) {
      const state = store.getState();
      const storedValue = selector(state);

      if (!isEmpty(storedValue)) {
        throw new axios.Cancel(envelope(storedValue));
      }
    }

    return config;
  });

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (axios.isCancel(error)) {
        return Promise.resolve(error.message);
      }

      const status = error.response ? error.response.status : null;
      if (status === UNAUTHORIZED || status === MAINTENANCE) {
        window.location.reload(false);
      } else if (errorToastMessage === "default" || errorToastMessage === undefined) {
        notification.error({
          message: error?.response?.data?.message ?? String.ERROR,
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
