import { notification } from "antd";
import { USER_ROLES } from "@mds/common";
import { request, success, error } from "@/actions/genericActions";
import { NetworkReducerTypes } from "@mds/common/constants/networkReducerTypes";
import * as authenticationActions from "@/actions/authenticationActions";
import keycloak from "@mds/common/keycloak";

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
  const isProponent = roles.includes(USER_ROLES.role_minespace_proponent);
  dispatch(authenticationActions.storeIsProponent(isProponent));
};

export const getUserInfoFromToken = (tokenParsed) => (dispatch) => {
  dispatch(request(NetworkReducerTypes.GET_USER_INFO));

  if (!tokenParsed || new Date(tokenParsed.exp * 1000) < new Date()) {
    dispatch(error(NetworkReducerTypes.GET_USER_INFO));
    dispatch(unAuthenticateUser());
  } else {
    dispatch(getUserRoles(tokenParsed));
    dispatch(success(NetworkReducerTypes.GET_USER_INFO));
    dispatch(authenticationActions.authenticateUser(tokenParsed));
  }
  localStorage.removeItem("authenticationInProgressFlag");
};

export const authenticateUser = (accessToken) => (dispatch) => {
  dispatch(success(NetworkReducerTypes.AUTHENTICATE_USER));
  dispatch(getUserInfoFromToken(accessToken));
};
