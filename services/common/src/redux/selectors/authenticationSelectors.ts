import { createSelector } from "@reduxjs/toolkit";
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

export const getFormattedUserName = createSelector([getUserInfo], (userInfo) => {
  const { preferred_username, identity_provider } = userInfo;
  return identity_provider === "idir" ? `idir\\${preferred_username}` : preferred_username;
});
