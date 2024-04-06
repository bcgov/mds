import axios from "axios";
import { notification, Button } from "antd";
import * as String from "@mds/common/constants/strings";
import React from "react";
import * as API from "@mds/common/constants/API";
import { ENVIRONMENT } from "@mds/common";
import { createRequestHeader } from "./utils/RequestHeaders";
import { Feature, isFeatureEnabled } from "@mds/common";

// https://stackoverflow.com/questions/39696007/axios-with-promise-prototype-finally-doesnt-work
// eslint-disable-next-line @typescript-eslint/no-var-requires
const promiseFinally = require("promise.prototype.finally");

promiseFinally.shim();

const UNAUTHORIZED = 401;
const MAINTENANCE = 503;

const formatErrorMessage = (errorMessage) => {
  return errorMessage.replace("(psycopg2.", "(DatabaseError.");
};

let CustomAxios;

const notifymAdmin = (error) => {
  const business_message = error?.response?.data?.message;
  const trace_id = error?.response?.data?.trace_id;

  const payload = {
    business_error: business_message,
    trace_id: trace_id,
  };

  CustomAxios()
    .post(ENVIRONMENT.apiUrl + API.REPORT_ERROR, payload, createRequestHeader())
    .then((response) => {
      notification.success({
        message: "Error details sent to Admin. Thank you.",
        duration: 5,
      });
      return response;
    })
    .catch((err) => {
      throw new Error(err);
    });
};

CustomAxios = ({
  errorToastMessage = "default",
  suppressErrorNotification = false,
  successToastMessage = undefined,
} = {}) => {
  const instance = axios.create();

  instance.interceptors.response.use(
    (response) => {
      if (successToastMessage) {
        notification.success({
          message: successToastMessage,
          duration: 10,
        });
      }
      return response;
    },
    (error) => {
      if (axios.isCancel(error)) {
        return Promise.resolve(error.message);
      }
      const status = error.response ? error.response.status : null;
      if (status === UNAUTHORIZED || status === MAINTENANCE) {
        // @ts-ignore
        window.location.reload(false);
      } else if (
        (errorToastMessage === "default" || errorToastMessage === undefined) &&
        !suppressErrorNotification
      ) {
        console.error("Trace Id: ", error?.response?.data?.trace_id);
        const notificationKey = "errorNotification";
        const display_error_msg = formatErrorMessage(
          error?.response?.data?.message ?? String.ERROR
        );
        const trace_id = error?.response?.data?.trace_id ?? String.EMPTY;

        if (isFeatureEnabled(Feature.REPORT_ERROR)) {
          notification.error({
            key: notificationKey,
            message: display_error_msg,
            description: (
              <div>
                <p style={{ color: "grey" }}>
                  If you think this is a system error please help us to improve by informing the
                  system Admin{" "}
                </p>
                <p style={{ color: "grey", fontSize: "smaller" }}>Trace Id: {trace_id}</p>
              </div>
            ),
            duration: 10,
            btn: (
              <Button
                type="primary"
                size="small"
                onClick={() => {
                  notifymAdmin(error);
                  notification.close(notificationKey);
                }}
              >
                Tell Admin
              </Button>
            ),
          });
        } else {
          notification.error({
            key: notificationKey,
            message: formatErrorMessage(error?.response?.data?.message ?? String.ERROR),
            duration: 10,
          });
        }
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
