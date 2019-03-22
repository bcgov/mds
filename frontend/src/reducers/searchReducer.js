import * as actionTypes from "@/constants/actionTypes";
import { SEARCH } from "@/constants/reducerTypes";

/**
 * @file mineReducer.js
 * all data associated with new mine/existing mine records is handled witnin this reducer.
 */

const initialState = {
  searchResults: [],
  searchBarResults: [],
  searchTerms: [],
};

const searchReducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.STORE_SEARCH_RESULTS:
      return {
        ...state,
        searchResults: action.payload.search_results,
        searchBarResults: action.payload.search_results.slice(0, 10),
        searchTerms: action.payload.search_terms,
      };
    case actionTypes.CLEAR_SEARCH_RESULTS:
      return {
        ...state,
        searchBarResults: [],
      };
    default:
      return state;
  }
};

export const getSearchResults = (state) => state[SEARCH].searchResults;
export const getSearchBarResults = (state) => state[SEARCH].searchBarResults;
export const getSearchTerms = (state) => state[SEARCH].searchTerms;

export default searchReducer;
