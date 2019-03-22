import * as actionTypes from "@/constants/actionTypes";
import { SEARCH } from "@/constants/reducerTypes";

/**
 * @file mineReducer.js
 * all data associated with new mine/existing mine records is handled witnin this reducer.
 */

const initialState = {
  searchResults: [],
  searchTerms: [],
};

const searchReducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.STORE_SEARCH_RESULTS:
      return {
        ...state,
        searchResults: action.payload.search_results,
        searchTerms: action.payload.search_terms,
      };
    case actionTypes.CLEAR:
      return {
        searchResults: [],
        searchTerms: [],
      };
    default:
      return state;
  }
};

export const getSearchResults = (state) => state[SEARCH].searchResults;
export const getSearchTerms = (state) => state[SEARCH].searchTerms;

export default searchReducer;
