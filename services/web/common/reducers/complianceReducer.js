import * as actionTypes from "../constants/actionTypes";
import { COMPLIANCE } from "../constants/reducerTypes";

/**
 * @file mineReducer.js
 * all data associated with new mine/existing mine records is handled witnin this reducer.
 */

const initialState = {
  mineComplianceInfo: {},
};

export const complianceReducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.STORE_MINE_COMPLIANCE_INFO:
      return {
        ...state,
        mineComplianceInfo: action.payload,
      };
    case actionTypes.CLEAR:
      return {
        mineComplianceInfo: null,
      };
    default:
      return state;
  }
};

const complianceReducerObject = {
  [COMPLIANCE]: complianceReducer,
};

export const getMineComplianceInfo = (state) => state[COMPLIANCE].mineComplianceInfo;

export default complianceReducerObject;
