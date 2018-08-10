import * as ActionTypes from '@/constants/actionTypes';

export const authenticateUser = (userInfo = {}) => {
  return {
    type: ActionTypes.AUTHENTICATE_USER,
    payload: {
      userInfo,
    },
  };
};

export const logoutUser = () => {
  return {
    type: ActionTypes.LOGOUT,
  };
};

export const storeKeycloakData = (data= {}) => {
  return {
    type: ActionTypes.STORE_KEYCLOAK_DATA,
    payload: {
      data,
    },
  };
};