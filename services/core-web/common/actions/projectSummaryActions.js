import * as actionTypes from "../constants/actionTypes";

export const storeProjectSummaries = (payload) => ({
  type: actionTypes.STORE_PROJECT_SUMMARIES,
  payload,
});

export const storeProjectSummary = (payload) => ({
  type: actionTypes.STORE_PROJECT_SUMMARY,
  payload,
});
