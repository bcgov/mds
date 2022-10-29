import * as actionTypes from "../constants/actionTypes";
import { ORGBOOK } from "../constants/reducerTypes";

const initialState = {
  searchOrgBookResults: [],
  orgBookCredential: {},
};

export const orgbookReducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.STORE_ORGBOOK_SEARCH_RESULTS:
      return {
        ...state,
        searchOrgBookResults: action.payload,
      };
    case actionTypes.STORE_ORGBOOK_CREDENTIAL:
      return {
        ...state,
        orgBookCredential: action.payload,
      };
    default:
      return state;
  }
};

const orgbookReducerObject = {
  [ORGBOOK]: orgbookReducer,
};

export const getSearchOrgBookResults = (state) => state[ORGBOOK].searchOrgBookResults;
export const getOrgBookCredential = (state) => state[ORGBOOK].orgBookCredential;

export default orgbookReducerObject;
