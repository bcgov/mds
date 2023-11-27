import axios from "axios";
import { notification, Button } from "antd";
import * as String from "@mds/common/constants/strings";
import React from 'react';
import * as API from "@mds/common/constants/API";
import { ENVIRONMENT } from "@mds/common";
import { createRequestHeader } from "./utils/RequestHeaders";

// https://stackoverflow.com/questions/39696007/axios-with-promise-prototype-finally-doesnt-work
// eslint-disable-next-line @typescript-eslint/no-var-requires
const promiseFinally = require("promise.prototype.finally");

promiseFinally.shim();

const UNAUTHORIZED = 401;
const MAINTENANCE = 503;

const formatErrorMessage = (errorMessage) => {
  return errorMessage.replace("(psycopg2.", "(DatabaseError.");
};

const decodeJWT = (token) => {
  var base64Url = token.split('.')[1];
  var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));

  return JSON.parse(jsonPayload);
};

const notifymAdmin = (error) => {

  const business_message = error?.response?.data?.message;
  const detailed_error = error?.response?.data?.detailed_error;
  let date = new Date()
  const reported_date = `${date} ${date.getHours()}:${date.getMinutes()}`;
  const user = decodeJWT(createRequestHeader().headers.Authorization)

  const email_title = "[MDS_ERROR] [TO_ADMIN] - " + reported_date + " - " + business_message;
  const email_body = `<p><b>Business Error:</b> ${business_message}</P>
    <p>
      <b>Reporter's Name:</b> ${user.given_name} ${user.family_name}</br>
      <b>Reporter's Email:</b> ${user.email}</br>
      <b>Reporter's IDIR:</b> ${user.idir_username}<br/>
      <b>Reported Date:</b> ${reported_date}
    </P>
    <p><b>Detailed error:</b> ${detailed_error}</P><br/>
    <p>To create a Jira ticket
    <a href="https://bcmines.atlassian.net/jira/software/c/projects/MDS/boards/34/backlog">
    Click here</a> </P><br/>`;

  // TODO Recipients needs to be read from property file.
  const payload = {
    "title" : email_title,
    "body": email_body,
    "recipients" : ENVIRONMENT.errorNotifyRecipients
  };

  CustomAxios().post(ENVIRONMENT.apiUrl + API.COMMONS_EMAIL, payload, createRequestHeader())
    .then((response) => {
      notification.success({
        message: "Error details sent to Admin. Thank you.",
        duration: 5,
      });
      return response;
    })
    .catch((err) => {
      throw new Error(err);
    })
};

// @ts-ignore
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
        // @ts-ignore
        window.location.reload(false);
      } else if (
        (errorToastMessage === "default" || errorToastMessage === undefined) &&
        !suppressErrorNotification
      ) {
        console.error('Detailed Error: ', error?.response?.data?.detailed_error)
        const notificationKey = 'errorNotification';
        notification.error({
          key: notificationKey,
          message: formatErrorMessage(error?.response?.data?.message ?? String.ERROR),
          description: <p style={{ color: 'grey' }}>If you think this is a system error please help us to improve by informing the system Admin</p>,
          duration: 10,
          btn: (
            <Button type="primary" size="small"
              onClick={() => {
                  notifymAdmin(error);
                  notification.close(notificationKey);
                }}>
              Tell Admin
            </Button>
          ),
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
