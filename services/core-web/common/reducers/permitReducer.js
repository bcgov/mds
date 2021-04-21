import * as actionTypes from "../constants/actionTypes";
import { PERMITS } from "../constants/reducerTypes";

const initialState = {
  permits: [],
  draftPermits: [],
  permitConditions: [],
  editingConditionFlag: false,
};

export const permitReducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.STORE_PERMITS:
      return {
        ...state,
        permits: action.payload.records,
      };
    case actionTypes.STORE_DRAFT_PERMITS:
      return {
        ...state,
        draftPermits: action.payload.records,
      };
    case actionTypes.STORE_PERMIT_CONDITIONS:
      return {
        ...state,
        permitConditions: action.payload.records,
      };
    case actionTypes.STORE_EDITING_CONDITION_FLAG:
      return {
        ...state,
        editingConditionFlag: action.payload,
      };
    default:
      return state;
  }
};

const permitReducerObject = {
  [PERMITS]: permitReducer,
};

export const getUnformattedPermits = (state) => state[PERMITS].permits;
export const getDraftPermits = (state) => state[PERMITS].draftPermits;
export const getPermitConditions = (state) => state[PERMITS].permitConditions;
export const getEditingConditionFlag = (state) => state[PERMITS].editingConditionFlag;
export default permitReducerObject;
