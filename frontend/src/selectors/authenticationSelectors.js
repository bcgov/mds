import { createSelector } from "reselect";
import * as authenticationReducer from "@/reducers/authenticationReducer";
import { USER_ROLES } from "@/constants/environment";

export const {
  isAuthenticated,
  getUserAccessData,
  getUserInfo,
  getKeycloak,
} = authenticationReducer;

export const isAdmin = createSelector(
  [getUserAccessData],
  (userRoles) => userRoles.includes(USER_ROLES.role_admin)
);
