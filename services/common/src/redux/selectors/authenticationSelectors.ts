import * as authenticationReducer from "../reducers/authenticationReducer";

export const {
  getSystemFlag,
  isAuthenticated,
  getUserAccessData,
  getUserInfo,
  userHasRole,
  getRedirect,
  isProponent,
} = authenticationReducer;
