import { createSelector } from "@reduxjs/toolkit";
import * as authenticationReducer from "../reducers/authenticationReducer";
import { USER_ROLES } from "@mds/common/constants/environment";

export const {
  getSystemFlag,
  isAuthenticated,
  getUserAccessData,
  getUserInfo,
  getRedirect,
  isProponent,
} = authenticationReducer;

export const getFormattedUserName = createSelector([getUserInfo], (userInfo) => {
  const { preferred_username, identity_provider } = userInfo;
  return identity_provider === "idir" ? `idir\\${preferred_username}` : preferred_username;
});

export const userHasRole = (role: string) =>
  createSelector([getUserAccessData], (roles) => {
    return roles.includes(USER_ROLES[role] ?? role);
  })
