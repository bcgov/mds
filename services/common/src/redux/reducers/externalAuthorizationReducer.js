import * as actionTypes from "@mds/common/constants/actionTypes";
import { EXTERNAL_AUTHS } from "@mds/common/constants/reducerTypes";

/**
 * @file externalAuthorizationReducer.js
 * All data associated with authorizations and applications from other ministries or sources outside of EMLI.
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
