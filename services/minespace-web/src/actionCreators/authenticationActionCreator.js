import axios from "axios";
import { notification } from "antd";
import jwt from "jsonwebtoken";
import { ENVIRONMENT ,USER_INFO} from "@mds/common";
import { request, success, error } from "@/actions/genericActions";
import * as reducerTypes from "@/constants/reducerTypes";
import * as authenticationActions from "@/actions/authenticationActions";


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
  const roles = decodedToken.client_roles || [];
  const isProponent = roles.includes("minespace-proponent");
  dispatch(authenticationActions.storeIsProponent(isProponent));
};

export const getUserInfoFromToken = (token, errorMessage) => (dispatch) => {
  dispatch(request(reducerTypes.GET_USER_INFO));
  return axios
    .get(`${ENVIRONMENT.apiUrl + USER_INFO}`, {
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

export const authenticateUser = (accessToken) => async (dispatch) => {
  dispatch(success(reducerTypes.AUTHENTICATE_USER));
  localStorage.setItem("jwt", accessToken);
  dispatch(getUserInfoFromToken(accessToken));
};
