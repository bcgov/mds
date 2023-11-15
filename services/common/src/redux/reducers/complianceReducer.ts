import * as actionTypes from "@mds/common/constants/actionTypes";
import { COMPLIANCE } from "@mds/common/constants/reducerTypes";
import { IComplianceArticle } from "@mds/common";
import { RootState } from "@mds/common/redux/rootState";

/**
 * @file mineReducer.js
 * all data associated with new mine/existing mine records is handled witnin this reducer.
 */

interface IComplianceReducerState {
  mineComplianceInfo: IComplianceArticle;
}

const initialState: IComplianceReducerState = {
  mineComplianceInfo: {} as IComplianceArticle,
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

export const getMineComplianceInfo = (state: RootState) => state[COMPLIANCE].mineComplianceInfo;

export default complianceReducerObject;
