import * as ActionTypes from '@/constants/actionTypes';
import * as ReducerTypes from '@/constants/reducerTypes';


const initialState = {
  isAuthenticated: false,
  userInfo: {},
  keycloak: {}
};

const authenticationReducer = (state = initialState, action) => {
  switch (action.type) {
    case ActionTypes.AUTHENTICATE_USER:
      return {
        ...state,
        isAuthenticated: true,
        userInfo: action.payload.userInfo,
      };
  case ActionTypes.STORE_KEYCLOAK_DATA:
    return {
      ...state,
      keycloak: action.payload.data,
    };
    case ActionTypes.LOGOUT:
      return {
        ...state,
        isAuthenticated: false,
        userInfo: {},
        keycloak: {}
      };
    default:
      return state;
  }
};

export const isAuthenticated = (state) => state[ReducerTypes.AUTHENTICATION].isAuthenticated;
export const getUserInfo = (state) => state[ReducerTypes.AUTHENTICATION].userInfo;
export const getKeycloak = (state) => state[ReducerTypes.AUTHENTICATION].keycloak;

export default authenticationReducer;