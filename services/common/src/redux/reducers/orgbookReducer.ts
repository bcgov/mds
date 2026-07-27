import * as actionTypes from "@mds/common/constants/actionTypes";
import { ORGBOOK } from "@mds/common/constants/reducerTypes";
import { RootState } from "@mds/common/redux/rootState";
import { IBCRegistrationSearchResult, IOrgbookCredential } from "@mds/common/interfaces";

interface IOrgbookReducerState {
  searchOrgBookResults: IBCRegistrationSearchResult[];
  orgBookCredential: IOrgbookCredential;
}

const initialState: IOrgbookReducerState = {
  searchOrgBookResults: [],
  orgBookCredential: {} as IOrgbookCredential,
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

export const getBCRegistrationSearchResults = (state: RootState): IBCRegistrationSearchResult[] =>
  state[ORGBOOK].searchOrgBookResults;
export const getOrgBookCredential = (state: RootState): IOrgbookCredential =>
  state[ORGBOOK].orgBookCredential;

export default orgbookReducerObject;
