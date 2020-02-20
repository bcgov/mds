import * as ActionTypes from "@/constants/actionTypes";

export const authenticateUser = (userInfo = {}) => ({
  type: ActionTypes.AUTHENTICATE_USER,
  payload: {
    userInfo,
  },
});

export const logoutUser = () => ({
  type: ActionTypes.LOGOUT,
});

export const storeKeycloakData = (data = {}) => ({
  type: ActionTypes.STORE_KEYCLOAK_DATA,
  payload: {
    data,
  },
});

export const checkIdentityProvider = (isProponent) => ({
  type: ActionTypes.STORE_IDENTITY_PROVIDER,
  payload: {
    isProponent,
  },
});
