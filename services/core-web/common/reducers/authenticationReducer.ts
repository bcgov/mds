import * as ActionTypes from "../constants/actionTypes";
import { AUTHENTICATION } from "../constants/reducerTypes";
import { IUserInfo } from "@mds/common";
import { USER_ROLES } from "@common/constants/environment";

interface IAuthenticationReducerState {
  isAuthenticated: boolean;
  userAccessData: string[];
  userInfo: IUserInfo;
}

/**
 * @file authenticationReducer.js
 * all data associated with a users record is handled within this reducer.
 */
const initialState: IAuthenticationReducerState = {
  isAuthenticated: false,
  userAccessData: [],
  userInfo: {},
};

const getUserName = (tokenParsed) => {
  const { bceid_username } = tokenParsed;
  if (bceid_username && bceid_username.length > 0) {
    return `${bceid_username}@bceid`;
  }
  if (tokenParsed.idir_username) {
    return tokenParsed.idir_username;
  }
  return tokenParsed.preferred_username;
};

export const authenticationReducer = (state = initialState, action) => {
  switch (action.type) {
    case ActionTypes.AUTHENTICATE_USER:
      const tokenParsed = action.payload.userInfo;
      const preferred_username = getUserName(tokenParsed);
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
export const userHasRole = (state, role: string) =>
  state[AUTHENTICATION].userAccessData.includes(USER_ROLES[role]);

export default authenticationReducerObject;
