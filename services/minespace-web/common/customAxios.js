import axios from "axios";
import { notification } from "antd";
import * as String from "@mds/common/constants/strings";

// https://stackoverflow.com/questions/39696007/axios-with-promise-prototype-finally-doesnt-work
const promiseFinally = require("promise.prototype.finally");

promiseFinally.shim();

const UNAUTHORIZED = 401;
const MAINTENANCE = 503;

const formatErrorMessage = (errorMessage) => {
  return errorMessage.replace("(psycopg2.", "(DatabaseError.");
};

const CustomAxios = ({ errorToastMessage, suppressErrorNotification = false } = {}) => {
  const instance = axios.create();

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (axios.isCancel(error)) {
        return Promise.resolve(error.message);
      }

      const status = error.response ? error.response.status : null;
      if (status === UNAUTHORIZED || status === MAINTENANCE) {
        window.location.reload(false);
      } else if (
        (errorToastMessage === "default" || errorToastMessage === undefined) &&
        !suppressErrorNotification
      ) {
        notification.error({
          message: formatErrorMessage(error?.response?.data?.message ?? String.ERROR),
          duration: 10,
        });
      } else if (errorToastMessage && !suppressErrorNotification) {
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
