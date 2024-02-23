import * as ActionTypes from "@mds/common/constants/actionTypes";
import { AUTHENTICATION } from "@mds/common/constants/reducerTypes";
import { IUserInfo } from "@mds/common/interfaces";
import { SystemFlagEnum, USER_ROLES } from "@mds/common/constants";
import { RootState } from "@mds/common/redux/rootState";
import * as ReducerTypes from "@mds/common/constants/reducerTypes";

interface IAuthenticationReducerState {
  isAuthenticated: boolean;
  userInfo: IUserInfo;
  redirect: boolean;
  userAccessData: string[];
  isProponent: boolean;
  systemFlag: SystemFlagEnum;
}

/**
 * @file authenticationReducer.js
 * all data associated with a users record is handled within this reducer.
 */
const initialState: IAuthenticationReducerState = {
  isAuthenticated: false,
  userAccessData: [],
  userInfo: {} as IUserInfo,
  redirect: false,
  isProponent: undefined,
  systemFlag: undefined,
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
        redirect: GLOBAL_ROUTES?.MINES?.route,
      };
    case ActionTypes.STORE_USER_ACCESS_DATA:
      return {
        ...state,
        userAccessData: action.payload.roles,
      };
    case ActionTypes.STORE_IS_PROPONENT:
      return {
        ...state,
        isProponent: action.payload.data,
      };
    case ActionTypes.LOGOUT:
      return {
        ...state,
        isAuthenticated: false,
        userInfo: {},
        redirect: GLOBAL_ROUTES?.HOME?.route,
      };
    case ActionTypes.STORE_SYSTEM_FLAG:
      return {
        ...state,
        systemFlag: action.payload.flag,
      };
    default:
      return state;
  }
};

const authenticationReducerObject = {
  [AUTHENTICATION]: authenticationReducer,
};

export const getSystemFlag = (state: RootState) => state[AUTHENTICATION].systemFlag;
export const isAuthenticated = (state: RootState) => state[AUTHENTICATION].isAuthenticated;
export const getUserAccessData = (state: RootState) => state[AUTHENTICATION].userAccessData;
export const getUserInfo = (state: RootState) => state[AUTHENTICATION].userInfo;
export const userHasRole = (state: RootState, role: string) => {
  const userAccessData = state[AUTHENTICATION]?.userAccessData;
  if (!userAccessData) return false;
  return userAccessData.includes(USER_ROLES[role] ?? role);
};
export const getRedirect = (state) => state[ReducerTypes.AUTHENTICATION].redirect;
export const isProponent = (state) => state[ReducerTypes.AUTHENTICATION].isProponent;

export default authenticationReducerObject;
