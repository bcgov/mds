import * as actionTypes from "@/constants/actionTypes";
import { SEARCH } from "@/constants/reducerTypes";

/**
 * @file mineReducer.js
 * all data associated with new mine/existing mine records is handled witnin this reducer.
 */

const initialState = {
  searchResults: [],
};

const searchReducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.STORE_SEARCH_RESULTS:
      return {
        ...state,
        searchResults: action.payload.search_results,
      };
    case actionTypes.CLEAR:
      return {
        searchResults: [],
      };
    default:
      return state;
  }
};

export const getSearchResults = (state) => state[SEARCH].searchResults;

export default searchReducer;
