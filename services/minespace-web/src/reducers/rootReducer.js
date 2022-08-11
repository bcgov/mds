import { combineReducers } from "redux";
import { reducer as formReducer } from "redux-form";
import { loadingBarReducer } from "react-redux-loading-bar";
import {
  activityReducer,
  staticContentReducer,
  mineReducer,
  partiesReducer,
  permitReducer,
  complianceReducer,
  incidentReducer,
  reportReducer,
  modalReducer,
  documentViewerReducer,
  varianceReducer,
  securitiesReducer,
  orgbookReducer,
  workInformationReducer,
  projectReducer,
  minespaceReducer,
  noticeOfDepartureReducer,
} from "@common/reducers";
import * as reducerTypes from "@/constants/reducerTypes";
import authenticationReducer from "@/reducers/authenticationReducer";
import userMineReducer from "@/reducers/userMineReducer";
import networkReducer from "./networkReducer";

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
  ...activityReducer,
  ...complianceReducer,
  ...reportReducer,
  ...staticContentReducer,
  ...modalReducer,
  ...documentViewerReducer,
  ...mineReducer,
  ...permitReducer,
  ...partiesReducer,
  ...incidentReducer,
  ...varianceReducer,
  ...securitiesReducer,
  ...orgbookReducer,
  ...workInformationReducer,
  ...projectReducer,
  ...minespaceReducer,
  ...noticeOfDepartureReducer,
  [reducerTypes.AUTHENTICATION]: authenticationReducer,
  [reducerTypes.USER_MINE_INFO]: userMineReducer,
  [reducerTypes.GET_USER_MINE_INFO]: createReducer(networkReducer, reducerTypes.GET_USER_MINE_INFO),
  [reducerTypes.AUTHENTICATE_USER]: createReducer(networkReducer, reducerTypes.AUTHENTICATE_USER),
  [reducerTypes.GET_USER_INFO]: createReducer(networkReducer, reducerTypes.GET_USER_INFO),
  [reducerTypes.ADD_DOCUMENT_TO_VARIANCE]: createReducer(
    networkReducer,
    reducerTypes.ADD_DOCUMENT_TO_VARIANCE
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
