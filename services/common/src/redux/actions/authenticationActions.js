import * as ActionTypes from "@mds/common/constants/actionTypes";

export const authenticateUser = (userInfo = {}) => ({
  type: ActionTypes.AUTHENTICATE_USER,
  payload: {
    userInfo,
  },
});

export const logoutUser = () => ({
  type: ActionTypes.LOGOUT,
});

export const storeUserAccessData = (roles = {}) => ({
  type: ActionTypes.STORE_USER_ACCESS_DATA,
  payload: {
    roles,
  },
});
