import * as actionTypes from "@mds/common/constants/actionTypes";
import { SEARCH } from "@mds/common/constants/reducerTypes";
import { ISearchResult, ISearchResultList, ISimpleSearchResult } from "@mds/common/interfaces";

/**
 * @file mineReducer.js
 * all data associated with new mine/existing mine records is handled witnin this reducer.
 */

const initialState = {
  searchOptions: [],
  searchResults: [],
  searchFacets: { mine_region: [], mine_classification: [], permit_status: [], type: [] },
  searchBarResults: [],
  searchBarFacets: { mine: 0, person: 0, organization: 0, permit: 0, nod: 0, explosives_permit: 0 },
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
        searchFacets: action.payload.facets || initialState.searchFacets,
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
        searchBarFacets: action.payload.facets || initialState.searchBarFacets,
      };
    case actionTypes.CLEAR_SEARCH_BAR_RESULTS:
      return {
        ...state,
        searchBarResults: [],
        searchBarFacets: initialState.searchBarFacets,
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
export const getSearchResults = (state): ISearchResultList => state[SEARCH].searchResults;
export const getSearchFacets = (state) => state[SEARCH].searchFacets;
export const getSearchBarResults = (state): ISearchResult<ISimpleSearchResult>[] => state[SEARCH].searchBarResults;
export const getSearchBarFacets = (state): { mine: number; person: number; organization: number; permit: number; nod: number; explosives_permit: number } => state[SEARCH].searchBarFacets;
export const getSearchTerms = (state) => state[SEARCH].searchTerms;
export const getSearchSubsetResults = (state) => state[SEARCH].searchSubsetResults;

export default searchReducerObject;
