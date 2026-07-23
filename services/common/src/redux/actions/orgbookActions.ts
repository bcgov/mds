import * as ActionTypes from "@mds/common/constants/actionTypes";
import { IOrgBookSearchResult, IOrgbookCredential } from "@mds/common/interfaces";

export const storeSearchOrgBookResults = (payload: IOrgBookSearchResult[]) => ({
  type: ActionTypes.STORE_ORGBOOK_SEARCH_RESULTS,
  payload,
});

export const storeOrgBookCredential = (payload: IOrgbookCredential) => ({
  type: ActionTypes.STORE_ORGBOOK_CREDENTIAL,
  payload,
});
