import { combineReducers } from "redux";
import { reducer as formReducer } from "redux-form";
import { loadingBarReducer } from "react-redux-loading-bar";
import * as reducerTypes from "@/constants/reducerTypes";
import networkReducer from "./networkReducer";
import mineReducer from "@/reducers/mineReducer";
import partiesReducer from "@/reducers/partiesReducer";
import modalReducer from "@/reducers/modalReducer";
import authenticationReducer from "@/reducers/authenticationReducer";
import { createReducer } from "@/utils/helpers";

export const reducerObject = {
  form: formReducer,
  loadingBar: loadingBarReducer,
  [reducerTypes.AUTHENTICATION]: authenticationReducer,
  [reducerTypes.MINES]: mineReducer,
  [reducerTypes.PARTIES]: partiesReducer,
  [reducerTypes.MODAL]: modalReducer,
  [reducerTypes.CREATE_PARTY]: createReducer(
    networkReducer,
    reducerTypes.CREATE_PARTY
  ),
  [reducerTypes.GET_PARTIES]: createReducer(
    networkReducer,
    reducerTypes.GET_PARTIES
  ),
  [reducerTypes.GET_PARTY]: createReducer(
    networkReducer,
    reducerTypes.GET_PARTY
  ),
  [reducerTypes.CREATE_MINE_RECORD]: createReducer(
    networkReducer,
    reducerTypes.CREATE_MINE_RECORD
  ),
  [reducerTypes.GET_MINE_RECORDS]: createReducer(
    networkReducer,
    reducerTypes.GET_MINE_RECORDS
  ),
  [reducerTypes.GET_MINE_RECORD]: createReducer(
    networkReducer,
    reducerTypes.GET_MINE_RECORD
  ),
  [reducerTypes.GET_MINE_NAME_LIST]: createReducer(
    networkReducer,
    reducerTypes.GET_MINE_NAME_LIST
  ),
  [reducerTypes.GET_STATUS_OPTIONS]: createReducer(
    networkReducer,
    reducerTypes.GET_STATUS_OPTIONS
  ),
  [reducerTypes.GET_REGION_OPTIONS]: createReducer(
    networkReducer,
    reducerTypes.GET_REGION_OPTIONS
  ),
  [reducerTypes.UPDATE_MINE_RECORD]: createReducer(
    networkReducer,
    reducerTypes.UPDATE_MINE_RECORD
  ),
  [reducerTypes.ADD_MINE_MANAGER]: createReducer(
    networkReducer,
    reducerTypes.ADD_MINE_MANAGER
  ),
  [reducerTypes.ADD_PERMITTEE]: createReducer(
    networkReducer,
    reducerTypes.ADD_PERMITTEE
  ),
  [reducerTypes.CREATE_TSF]: createReducer(
    networkReducer,
    reducerTypes.CREATE_TSF
  ),
  [reducerTypes.GET_EXPECTED_DOCUMENT_STATUS]: createReducer(
    networkReducer,
    reducerTypes.GET_EXPECTED_DOCUMENT_STATUS
  ),
};

export const rootReducer = combineReducers(reducerObject);
