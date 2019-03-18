import axios from "axios";
import { notification } from "antd";
import { request, success, error } from "@/actions/genericActions";
import * as reducerTypes from "@/constants/reducerTypes";
import * as authenticationActions from "@/actions/authenticationActions";
import queryString from "query-string";
import * as ENV from "@/constants/environment";

export const unAuthenticateUser = () => (dispatch) => {
  dispatch(authenticationActions.logoutUser());
  localStorage.removeItem("jwt");
};

export const getUserInfoFromToken = (token) => (dispatch) => {
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
    });
};

export const authenticateUser = (code) => (dispatch) => {
  const data = {
    code,
    grant_type: "authorization_code",
    redirect_uri: ENV.BCEID_LOGIN_REDIRECT_URI,
    client_id: ENV.KEYCLOAK.clientId,
  };
  dispatch(request(reducerTypes.AUTHENTICATE_USERR));
  return axios
    .post(ENV.KEYCLOAK.tokenURL, queryString.stringify(data))
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
      unAuthenticateUser();
    });
};
