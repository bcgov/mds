import * as ActionTypes from "@mds/common/constants/actionTypes";

export const authenticateUser = (userInfo = {}) => ({
  type: ActionTypes.AUTHENTICATE_USER,
  payload: {
    userInfo,
  },
});

export const storeSystemFlag = (flag: "core" | "ms") => ({
  type: ActionTypes.STORE_SYSTEM_FLAG,
  payload: {
    flag,
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
