import * as ActionTypes from "@mds/common/constants/actionTypes";

export const storeSearchOrgBookResults = (payload) => ({
  type: ActionTypes.STORE_ORGBOOK_SEARCH_RESULTS,
  payload,
});

export const storeOrgBookCredential = (payload) => ({
  type: ActionTypes.STORE_ORGBOOK_CREDENTIAL,
  payload,
});
