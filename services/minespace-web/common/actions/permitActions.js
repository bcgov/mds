import * as actionTypes from "../constants/actionTypes";

export const storePermits = (payload) => ({
  type: actionTypes.STORE_PERMITS,
  payload,
});

export const storeDraftPermits = (payload) => ({
  type: actionTypes.STORE_DRAFT_PERMITS,
  payload,
});

export const storePermitConditions = (payload) => ({
  type: actionTypes.STORE_PERMIT_CONDITIONS,
  payload,
});

export const storeEditingConditionFlag = (payload) => ({
  type: actionTypes.STORE_EDITING_CONDITION_FLAG,
  payload,
});
