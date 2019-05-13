import * as ActionTypes from "../constants/actionTypes";

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
