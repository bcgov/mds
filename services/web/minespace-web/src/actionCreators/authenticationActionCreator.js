import axios from "axios";
import { notification } from "antd";
import queryString from "query-string";
import { request, success, error } from "@/actions/genericActions";
import * as reducerTypes from "@/constants/reducerTypes";
import * as authenticationActions from "@/actions/authenticationActions";
import * as ENV from "@/constants/environment";

export const unAuthenticateUser = (toastMessage) => (dispatch) => {
  dispatch(authenticationActions.logoutUser());
  localStorage.removeItem("jwt");
  if (toastMessage) {
    notification.success({
      message: toastMessage,
      duration: 10,
    });
  }
};

export const getUserInfoFromToken = (token, errorMessage) => (dispatch) => {
  dispatch(request(reducerTypes.GET_USER_INFO));
  return axios
    .get(ENV.KEYCLOAK.userInfoURL, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((response) => {
      dispatch(success(reducerTypes.GET_USER_INFO));
      dispatch(authenticationActions.authenticateUser(response.data));
    })
    .catch((err) => {
      dispatch(error(reducerTypes.GET_USER_INFO));
      dispatch(unAuthenticateUser());
      if (errorMessage) {
        notification.error({
          message: errorMessage,
          duration: 10,
        });
      } else {
        throw err;
      }
    });
};

export const authenticateUser = (code) => (dispatch) => {
  const data = {
    code,
    grant_type: "authorization_code",
    redirect_uri: ENV.BCEID_LOGIN_REDIRECT_URI,
    client_id: ENV.KEYCLOAK.clientId,
  };
  dispatch(request(reducerTypes.AUTHENTICATE_USER));
  return axios
    .post(ENV.KEYCLOAK.tokenURL, queryString.stringify(data))
    .then((response) => {
      dispatch(success(reducerTypes.AUTHENTICATE_USER));
      localStorage.setItem("jwt", response.data.access_token);
      return dispatch(getUserInfoFromToken(response.data.access_token));
    })
    .catch(() => {
      notification.error({
        message: "Unexpected error occured, please try again",
        duration: 10,
      });
      dispatch(error(reducerTypes.AUTHENTICATE_USER));
      dispatch(unAuthenticateUser());
    });
};
