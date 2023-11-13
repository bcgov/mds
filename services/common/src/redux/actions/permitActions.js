import * as actionTypes from "@mds/common/constants/actionTypes";

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

export const storeStandardPermitConditions = (payload) => ({
  type: actionTypes.STORE_STANDARD_PERMIT_CONDITIONS,
  payload,
});

export const storeEditingPreambleFlag = (payload) => ({
  type: actionTypes.STORE_EDITING_PREAMBLE_FLAG,
  payload,
});
