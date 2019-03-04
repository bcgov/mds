import * as actionTypes from "../constants/actionTypes";

export const storePermits = (payload) => ({
  type: actionTypes.STORE_PERMITS,
  payload,
});

export const storePermitStatusOptions = (payload) => ({
  type: actionTypes.STORE_PERMIT_STATUS_OPTIONS,
  payload,
});
