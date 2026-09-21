import axios, { AxiosError, AxiosInstance } from "axios";
import { notification, Button } from "antd";
import * as String from "@mds/common/constants/strings";
import React from "react";
import ReactDOM from "react-dom";
import * as API from "@mds/common/constants/API";
import { ENVIRONMENT } from "@mds/common/constants/environment";
import { createRequestHeader } from "./utils/RequestHeaders";
import { Feature, isFeatureEnabled } from "@mds/common/utils";
import ReportErrorModal, {
  ReportErrorDetails,
} from "@mds/common/components/common/ReportErrorModal";

// https://stackoverflow.com/questions/39696007/axios-with-promise-prototype-finally-doesnt-work
// eslint-disable-next-line @typescript-eslint/no-var-requires
const promiseFinally = require("promise.prototype.finally");

promiseFinally.shim();

const UNAUTHORIZED = 401;
const MAINTENANCE = 503;

export interface MDSErrorResponseData {
  message?: string;
  detailed_error?: string;
  trace_id?: string;
}

export type MDSError = AxiosError<MDSErrorResponseData>;

const formatErrorMessage = (errorMessage: string) => {
  return errorMessage.replace("(psycopg2.", "(DatabaseError.");
};

export interface CustomAxiosOptions {
  errorToastMessage?: string;
  suppressErrorNotification?: boolean;
  successToastMessage?: string;
}

export const notifymAdmin = (
  error: MDSError,
  { severity, description, seenBefore }: Partial<ReportErrorDetails> = {}
) => {
  const business_message = error?.response?.data?.message;
  const trace_id = error?.response?.data?.trace_id;

  const payload = {
    business_error: business_message,
    trace_id: trace_id,
    severity,
    description,
    seen_before: seenBefore,
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
      notification.error({
        message: "Failed to send error report to Admin. Please try again later.",
        duration: 5,
      });
      console.error("Failed to report error:", err);
    });
};

export const openReportErrorModal = (error: MDSError) => {
  const container = document.createElement("div");
  document.body.appendChild(container);

  const cleanup = () => {
    ReactDOM.unmountComponentAtNode(container);
    container.remove();
  };

  const render = (open: boolean) => {
    ReactDOM.render(
      <ReportErrorModal
        open={open}
        onCancel={cleanup}
        onSubmit={(details) => {
          notifymAdmin(error, details);
          cleanup();
        }}
      />,
      container
    );
  };

  render(true);
};

export const CustomAxios = ({
  errorToastMessage = "default",
  suppressErrorNotification = false,
  successToastMessage = undefined,
}: CustomAxiosOptions = {}): AxiosInstance => {
  const instance = axios.create({
    adapter: process.env.NODE_ENV === "test" ? undefined : ['xhr', 'http']
  });

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
    (error: MDSError) => {
      if (axios.isCancel(error)) {
        return Promise.resolve(error.message);
      }

      if (!document) {
        // If the DOM document is not available to render, do not try to render a notification.
        // This happens in some of our tests where axios is not mocked and causes a "TypeError: Cannot read property 'createElement' of null"
        // error to be thrown by antd and prevents code coverage from being generated.
        return Promise.reject(error);
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
                {error?.response?.data?.detailed_error &&
                  error?.response?.data?.detailed_error !== "Not provided" && (
                    <p className="margin-large--top">{error?.response?.data?.detailed_error}</p>
                  )}
                <p style={{ color: "grey" }}>
                  If you think this is a system error please help us to improve by informing the
                  system Admin
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
                  openReportErrorModal(error);
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
}

export default CustomAxios;
