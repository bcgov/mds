import * as ActionTypes from "@mds/common/constants/actionTypes";

export const storeSearchOptions = (payload) => ({
  type: ActionTypes.STORE_SEARCH_OPTIONS,
  payload,
});

export const storeSearchResults = (payload) => ({
  type: ActionTypes.STORE_SEARCH_RESULTS,
  payload,
});

export const storeSearchBarResults = (payload) => ({
  type: ActionTypes.STORE_SEARCH_BAR_RESULTS,
  payload,
});

export const clearSearchBarResults = (payload) => ({
  type: ActionTypes.CLEAR_SEARCH_BAR_RESULTS,
  payload,
});

export const clearAllSearchResults = () => ({
  type: ActionTypes.CLEAR_ALL_SEARCH_RESULTS,
});

export const storeSubsetSearchResults = (payload) => ({
  type: ActionTypes.STORE_SUBSET_SEARCH_RESULTS,
  payload,
});
