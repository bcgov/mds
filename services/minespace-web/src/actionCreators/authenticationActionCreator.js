import axios from "axios";
import { notification } from "antd";
import jwt from "jsonwebtoken";
import queryString from "query-string";
import * as COMMON_ENV from "@common/constants/environment";
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
  console.log("I WAS CALLED, SO THE PREVIOUS ACTION WADS A SUCCESS I WAS DISPATCHED");
  console.log("here is my token:", token);
  dispatch(request(reducerTypes.GET_USER_INFO));
  return axios
    .get(COMMON_ENV.KEYCLOAK.userInfoURL, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((response) => {
      console.log("this is working as intended");
      dispatch(getUserRoles(token));
      dispatch(success(reducerTypes.GET_USER_INFO));
      dispatch(authenticationActions.authenticateUser(response.data));
    })
    .catch((err) => {
      console.log("not loggin in for some unknown reason whyyy");
      console.log(err);
      console.log(new Error(err));
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
  console.log("authenticateUser", redirectUrl);
  console.log("AUTHENTICATING ACTION CREATOR: code ===", code);
  // const redirect_uri = redirectUrl ? redirectUrl : MINESPACE_ENV.BCEID_LOGIN_REDIRECT_URI;
  const data = {
    code,
    grant_type: "authorization_code",
    redirect_uri: redirectUrl ? redirectUrl : MINESPACE_ENV.BCEID_LOGIN_REDIRECT_URI,
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

export const authenticateCoreUser = (code, redirectUrl = "") => (dispatch) => {
  console.log("authenticateCoreUser", redirectUrl);
  console.log("AUTHENTICATING ACTION CREATOR: code ===", code);
  // const redirect_uri = redirectUrl ? redirectUrl : MINESPACE_ENV.BCEID_LOGIN_REDIRECT_URI;
  const data = {
    code,
    grant_type: "authorization_code",
    redirect_uri: redirectUrl ? redirectUrl : MINESPACE_ENV.BCEID_LOGIN_REDIRECT_URI,
    client_id: COMMON_ENV.KEYCLOAK.clientId,
  };
  dispatch(request(reducerTypes.AUTHENTICATE_USER));
  return axios
    .post(COMMON_ENV.KEYCLOAK.tokenURL, queryString.stringify(data))
    .then((response) => {
      dispatch(success(reducerTypes.AUTHENTICATE_USER));
      localStorage.setItem("jwt", response.data.access_token);
      return response;
    })
    .catch((err) => {
      notification.error({
        message: "Unexpected error occurred, please try again",
        duration: 10,
      });
      dispatch(error(reducerTypes.AUTHENTICATE_USER));
      throw new Error(err);
    });
};
