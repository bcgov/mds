import * as ActionTypes from "../constants/actionTypes";

export const storeSearchOrgBookResults = (payload) => ({
  type: ActionTypes.STORE_ORGBOOK_SEARCH,
  payload,
});

export const storeOrgBookCredential = (payload) => ({
  type: ActionTypes.STORE_ORGBOOK_CREDENTIAL,
  payload,
});
