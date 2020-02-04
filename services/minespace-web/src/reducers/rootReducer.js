import { combineReducers } from "redux";
import { reducer as formReducer } from "redux-form";
import { loadingBarReducer } from "react-redux-loading-bar";
import { staticContentReducer, mineReducer, partiesReducer, permitReducer } from "@common/reducers";
import networkReducer from "./networkReducer";
import * as reducerTypes from "@/constants/reducerTypes";
import authenticationReducer from "@/reducers/authenticationReducer";
import userMineReducer from "@/reducers/userMineReducer";
import modalReducer from "@/reducers/modalReducer";
import varianceReducer from "@/reducers/varianceReducer";
import reportReducer from "./reportReducer";

// Function to create a reusable reducer (used in src/reducers/rootReducer)
export const createReducer = (reducer, name) => (state, action) => {
  if (name !== action.name && state !== undefined) {
    return state;
  }
  return reducer(state, action);
};

export const reducerObject = {
  form: formReducer,
  loadingBar: loadingBarReducer,
  [reducerTypes.AUTHENTICATION]: authenticationReducer,
  [reducerTypes.USER_MINE_INFO]: userMineReducer,
  [reducerTypes.VARIANCES]: varianceReducer,
  [reducerTypes.MODAL]: modalReducer,
  [reducerTypes.REPORTS]: reportReducer,
  ...staticContentReducer,
  ...mineReducer,
  ...permitReducer,
  ...partiesReducer,
  [reducerTypes.GET_USER_MINE_INFO]: createReducer(networkReducer, reducerTypes.GET_USER_MINE_INFO),
  [reducerTypes.AUTHENTICATE_USER]: createReducer(networkReducer, reducerTypes.AUTHENTICATE_USER),
  [reducerTypes.GET_USER_INFO]: createReducer(networkReducer, reducerTypes.GET_USER_INFO),
  [reducerTypes.ADD_DOCUMENT_TO_VARIANCE]: createReducer(
    networkReducer,
    reducerTypes.ADD_DOCUMENT_TO_VARIANCE
  ),
  [reducerTypes.CREATE_MINE_VARIANCE]: createReducer(
    networkReducer,
    reducerTypes.CREATE_MINE_VARIANCE
  ),
  [reducerTypes.UPDATE_MINE_VARIANCE]: createReducer(
    networkReducer,
    reducerTypes.UPDATE_MINE_VARIANCE
  ),
  [reducerTypes.GET_MINE_VARIANCES]: createReducer(networkReducer, reducerTypes.GET_MINE_VARIANCES),
  [reducerTypes.REMOVE_DOCUMENT_FROM_VARIANCE]: createReducer(
    networkReducer,
    reducerTypes.REMOVE_DOCUMENT_FROM_VARIANCE
  ),
  [reducerTypes.GET_VARIANCE_STATUS_OPTIONS]: createReducer(
    networkReducer,
    reducerTypes.GET_VARIANCE_STATUS_OPTIONS
  ),
  [reducerTypes.GET_COMPLIANCE_CODES]: createReducer(
    networkReducer,
    reducerTypes.GET_COMPLIANCE_CODES
  ),
};

export const rootReducer = combineReducers(reducerObject);
