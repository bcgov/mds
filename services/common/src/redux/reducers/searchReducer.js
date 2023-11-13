import * as actionTypes from "@mds/common/constants/actionTypes";
import { SEARCH } from "@mds/common/constants/reducerTypes";

/**
 * @file mineReducer.js
 * all data associated with new mine/existing mine records is handled witnin this reducer.
 */

const initialState = {
  searchOptions: [],
  searchResults: [],
  searchBarResults: [],
  searchTerms: [],
  searchSubsetResults: [],
};

export const searchReducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.STORE_SEARCH_OPTIONS:
      return {
        ...state,
        searchOptions: action.payload,
      };
    case actionTypes.STORE_SEARCH_RESULTS:
      return {
        ...state,
        searchResults: action.payload.search_results,
        searchTerms: action.payload.search_terms,
      };
    case actionTypes.STORE_SUBSET_SEARCH_RESULTS:
      return {
        ...state,
        searchSubsetResults: action.payload,
      };
    case actionTypes.STORE_SEARCH_BAR_RESULTS:
      return {
        ...state,
        searchBarResults: action.payload.search_results,
      };
    case actionTypes.CLEAR_SEARCH_BAR_RESULTS:
      return {
        ...state,
        searchBarResults: [],
      };
    case actionTypes.CLEAR_ALL_SEARCH_RESULTS:
      return initialState;
    default:
      return state;
  }
};

const searchReducerObject = {
  [SEARCH]: searchReducer,
};

export const getSearchOptions = (state) => state[SEARCH].searchOptions;
export const getSearchResults = (state) => state[SEARCH].searchResults;
export const getSearchBarResults = (state) => state[SEARCH].searchBarResults;
export const getSearchTerms = (state) => state[SEARCH].searchTerms;
export const getSearchSubsetResults = (state) => state[SEARCH].searchSubsetResults;

export default searchReducerObject;
