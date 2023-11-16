import axios from "axios";
import { notification, Button } from "antd";
import * as String from "./constants/strings";
import React from 'react';
import * as API from "./constants/API";
import * as reducerTypes from "./constants/reducerTypes";
import { ENVIRONMENT } from "@mds/common";
import { createRequestHeader } from "./utils/RequestHeaders";
// import { getUserInfo } from "@common/selectors/authenticationSelectors";
// import { useSelector, useDispatch } from "react-redux";

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

  const notifymAdmin = (error) => {
    const business_message = error?.response?.data?.message;
    const detailed_error = error?.response?.data?.detailed_error;

    // const dispatch = useDispatch();
    // const userInfo = useSelector(getUserInfo);
    // const user_name = userInfo ? userInfo.preferred_username : 'Unknown User';
    const user_name = "user-name"

    let date = new Date()
    const reported_date = `${date} ${date.getHours()}:${date.getMinutes()}`;
    const email_title = "[MDS_ERROR] [TO_ADMIN] - " + reported_date + " - " + business_message;
    const email_body = `<p>Business error: ${business_message}</P>
      <p>Reported date: ${reported_date}</P>
      <p>Reported by: ${user_name}</P>
      <p>Detailed error: ${detailed_error}</P><br/>
      <p>To create a Jira ticket,
      <a href="https://bcmines.atlassian.net/jira/software/c/projects/MDS/boards/34/backlog">
      Click here</a> </P><br/>`;

    // TODO Recipients needs to be read from property file.
    const payload = {
      "title" : email_title,
      "body": email_body,
      "recipients" : "isuru.gunawardana@aot-technologies.com"
    };

    instance.post(ENVIRONMENT.apiUrl + API.COMMONS_EMAIL, payload, createRequestHeader())
      .then((response) => {
        notification.success({
          message: "Error details sent to Admin. Thank you.",
          duration: 5,
        });
        dispatch(success(reducerTypes.COMMONS_EMAIL));
        return response;
      })
      .catch((err) => {
        dispatch(error(reducerTypes.COMMONS_EMAIL));
        throw new Error(err);
      })
  };

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
        console.log('Detailed Error: ', error?.response?.data?.detailed_error)
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
