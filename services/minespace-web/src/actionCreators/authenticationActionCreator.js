import axios from "axios";
import { notification } from "antd";
import jwt from "jsonwebtoken";
import queryString from "query-string";
import * as COMMON_ENV from "@mds/common";
import { request, success, error } from "@/actions/genericActions";
import * as reducerTypes from "@/constants/reducerTypes";
import * as authenticationActions from "@/actions/authenticationActions";
import * as MINESPACE_ENV from "@/constants/environment";

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

export const getUserRoles = (token) => (dispatch) => {
  const decodedToken = jwt.decode(token);
  const isProponent = decodedToken.realm_access.roles.includes("minespace-proponent");
  dispatch(authenticationActions.storeIsProponent(isProponent));
};

export const getUserInfoFromToken = (token, errorMessage) => (dispatch) => {
  dispatch(request(reducerTypes.GET_USER_INFO));
  return axios
    .get(COMMON_ENV.KEYCLOAK.userInfoURL, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((response) => {
      dispatch(getUserRoles(token));
      dispatch(success(reducerTypes.GET_USER_INFO));
      dispatch(authenticationActions.authenticateUser(response.data));
      // core User has successfully logged in, remove flag from localStorage
      localStorage.removeItem("authenticatingFromCoreFlag");
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
        throw new Error(err);
      }
    });
};

export const authenticateUser = (code, redirectUrl = "") => (dispatch) => {
  const redirect_uri = redirectUrl ? redirectUrl : MINESPACE_ENV.BCEID_LOGIN_REDIRECT_URI;
  const data = {
    code,
    grant_type: "authorization_code",
    redirect_uri,
    client_id: COMMON_ENV.KEYCLOAK.clientId,
  };
  dispatch(request(reducerTypes.AUTHENTICATE_USER));
  return axios
    .post(COMMON_ENV.KEYCLOAK.tokenURL, queryString.stringify(data))
    .then((response) => {
      dispatch(success(reducerTypes.AUTHENTICATE_USER));
      localStorage.setItem("jwt", response.data.access_token);
      dispatch(getUserInfoFromToken(response.data.access_token));
      return response;
    })
    .catch((err) => {
      notification.error({
        message: "Unexpected error occurred, please try again",
        duration: 10,
      });
      dispatch(error(reducerTypes.AUTHENTICATE_USER));
      dispatch(unAuthenticateUser());
      throw new Error(err);
    });
};
