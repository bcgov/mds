import * as actionTypes from "../constants/actionTypes";

export const storePermits = (payload) => ({
  type: actionTypes.STORE_PERMITS,
  payload,
});

export const storeDraftPermits = (payload) => ({
  type: actionTypes.STORE_DRAFT_PERMITS,
  payload,
});
