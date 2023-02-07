import * as ActionTypes from "../constants/actionTypes";
import { AUTHENTICATION } from "../constants/reducerTypes";

/**
 * @file authenticationReducer.js
 * all data associated with a users record is handled within this reducer.
 */
const initialState = {
  isAuthenticated: false,
  userAccessData: [],
  userInfo: {},
};

export const authenticationReducer = (state = initialState, action) => {
  switch (action.type) {
    case ActionTypes.AUTHENTICATE_USER:
      const tokenParsed = action.payload.userInfo;
      const preferred_username =
        tokenParsed.idir_username ?? tokenParsed.bceid_username ?? tokenParsed.preferred_username;
      return {
        ...state,
        isAuthenticated: true,
        userInfo: {
          ...action.payload.userInfo,
          preferred_username,
        },
      };
    case ActionTypes.STORE_USER_ACCESS_DATA:
      return {
        ...state,
        userAccessData: action.payload.roles,
      };
    case ActionTypes.LOGOUT:
      return {
        ...state,
        isAuthenticated: false,
        userInfo: {},
      };
    default:
      return state;
  }
};

const authenticationReducerObject = {
  [AUTHENTICATION]: authenticationReducer,
};

export const isAuthenticated = (state) => state[AUTHENTICATION].isAuthenticated;
export const getUserAccessData = (state) => state[AUTHENTICATION].userAccessData;
export const getUserInfo = (state) => state[AUTHENTICATION].userInfo;

export default authenticationReducerObject;
