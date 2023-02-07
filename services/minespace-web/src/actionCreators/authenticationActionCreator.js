import { notification } from "antd";
import { request, success, error } from "@/actions/genericActions";
import * as reducerTypes from "@/constants/reducerTypes";
import * as authenticationActions from "@/actions/authenticationActions";
import keycloak from "@/keycloak";

export const unAuthenticateUser = (toastMessage) => (dispatch) => {
  dispatch(authenticationActions.logoutUser());
  if (toastMessage) {
    notification.success({
      message: toastMessage,
      duration: 10,
    });
  }
};

export const getUserRoles = () => (dispatch) => {
  const roles = keycloak.tokenParsed.client_roles || [];
  const isProponent = roles.includes("minespace-proponent");
  dispatch(authenticationActions.storeIsProponent(isProponent));
};

export const getUserInfoFromToken = (tokenParsed) => (dispatch) => {
  dispatch(request(reducerTypes.GET_USER_INFO));

  if (!tokenParsed || new Date(tokenParsed.exp * 1000) < new Date()) {
    dispatch(error(reducerTypes.GET_USER_INFO));
    dispatch(unAuthenticateUser());
  } else {
    dispatch(getUserRoles(tokenParsed));
    dispatch(success(reducerTypes.GET_USER_INFO));
    dispatch(authenticationActions.authenticateUser(tokenParsed));
  }
  localStorage.removeItem("authenticationInProgressFlag");
};

export const authenticateUser = (accessToken) => (dispatch) => {
  dispatch(success(reducerTypes.AUTHENTICATE_USER));
  dispatch(getUserInfoFromToken(accessToken));
};
