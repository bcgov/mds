import * as actionTypes from "@/constants/actionTypes";
import { STATIC_CONTENT } from "@/constants/reducerTypes";

/**
 * @file staticContentReducer.js
 * all data associated with static content to populate form inputs is handled witnin this reducer.
 */

const initialState = {
  mineStatusOptions: [],
  mineRegionOptions: [],
  mineTenureTypes: [],
  mineDisturbanceOptions: [],
  mineCommodityOptions: [],
  expectedDocumentStatusOptions: [],
  mineTSFRequiredReports: [],
};

const staticContentReducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.STORE_STATUS_OPTIONS:
      return {
        ...state,
        mineStatusOptions: action.payload.options,
      };
    case actionTypes.STORE_REGION_OPTIONS:
      return {
        ...state,
        mineRegionOptions: action.payload.options,
      };
    case actionTypes.STORE_TENURE_TYPES:
      return {
        ...state,
        mineTenureTypes: action.payload.options,
      };
    case actionTypes.STORE_DISTURBANCE_OPTIONS:
      return {
        ...state,
        mineDisturbanceOptions: action.payload.options,
      };
    case actionTypes.STORE_COMMODITY_OPTIONS:
      return {
        ...state,
        mineCommodityOptions: action.payload.options,
      };
    case actionTypes.STORE_DOCUMENT_STATUS_OPTIONS:
      return {
        ...state,
        expectedDocumentStatusOptions: action.payload.options,
      };
    case actionTypes.STORE_MINE_TSF_REQUIRED_DOCUMENTS:
      return {
        ...state,
        mineTSFRequiredReports: action.payload.required_documents,
      };
    default:
      return state;
  }
};

export const getMineStatusOptions = (state) => state[STATIC_CONTENT].mineStatusOptions;
export const getMineRegionOptions = (state) => state[STATIC_CONTENT].mineRegionOptions;
export const getMineTenureTypes = (state) => state[STATIC_CONTENT].mineTenureTypes;
export const getMineDisturbanceOptions = (state) => state[STATIC_CONTENT].mineDisturbanceOptions;
export const getMineCommodityOptions = (state) => state[STATIC_CONTENT].mineCommodityOptions;
export const getExpectedDocumentStatusOptions = (state) =>
  state[STATIC_CONTENT].expectedDocumentStatusOptions;
export const getMineTSFRequiredReports = (state) => state[STATIC_CONTENT].mineTSFRequiredReports;

export default staticContentReducer;
