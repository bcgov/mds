import * as actionTypes from "../constants/actionTypes";
import { EXTERNAL_AUTHS } from "../constants/reducerTypes";

/**
 * @file mineReducer.js
 * all data associated with new mine/existing mine records is handled witnin this reducer.
 */

const initialState = {
  mineEpicInfo: {},
};

export const externalAuthorizationReducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.STORE_MINE_EPIC_INFO:
      return {
        ...state,
        mineEpicInfo: action.payload.records,
      };

    default:
      return state;
  }
};

const externalAuthorizationReducerObject = {
  [EXTERNAL_AUTHS]: externalAuthorizationReducer,
};

export const getMineEpicInfo = (state) => state[EXTERNAL_AUTHS].mineEpicInfo;

export default externalAuthorizationReducerObject;
