import axios from "axios";
import { notification } from "antd";
import { request, success, error } from "@/actions/genericActions";
import * as reducerTypes from "@/constants/reducerTypes";
import * as authenticationActions from "@/actions/authenticationActions";
import queryString from "query-string";
import * as API from "@/constants/API";

export const unAuthenticateUser = () => (dispatch) => {
  dispatch(authenticationActions.logoutUser());
  localStorage.removeItem("jwt");
  notification.success({
    message: "You have successfully logged out",
    duration: 10,
  });
};

export const getUserInfoFromToken = (token) => (dispatch) => {
  dispatch(request(reducerTypes.GET_USER_INFO));
  return axios
    .get(API.GET_USER_INFO_FROM_SSO, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((response) => {
      dispatch(success(reducerTypes.GET_USER_INFO));
      dispatch(authenticationActions.authenticateUser(response.data));
    })
    .catch(() => {
      notification.error({
        message: "Unable to get user Information at this time. Try again",
        duration: 10,
      });
      dispatch(unAuthenticateUser());
      dispatch(error(reducerTypes.GET_USER_INFO));
    });
};

export const authenticateUser = (code) => (dispatch) => {
  const data = {
    code,
    grant_type: "authorization_code",
    redirect_uri: API.SSO_LOGIN_REDIRECT_URI,
    client_id: API.SSO_CLIENT_ID,
  };
  dispatch(request(reducerTypes.AUTHENTICATE_USERR));
  return axios
    .post(API.GET_TOKEN_FROM_SSO, queryString.stringify(data))
    .then((response) => {
      dispatch(success(reducerTypes.AUTHENTICATE_USER));
      localStorage.setItem("jwt", response.data.access_token);
      dispatch(getUserInfoFromToken(response.data.access_token));
    })
    .catch(() => {
      notification.error({
        message: "Unexpected error occured, please try again",
        duration: 10,
      });
      dispatch(error(reducerTypes.AUTHENTICATE_USER));
    });
};
