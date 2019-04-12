import * as actionTypes from "@/constants/actionTypes";
import { createDropDownList } from "@/utils/helpers";
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
  provinceOptions: [],
  optionsLoaded: false,
  permitStatusCodes: [],
  applicationStatusCodes: [],
  complianceCodes: [],
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
        mineTenureTypes: createDropDownList(action.payload, "description", "mine_tenure_type_code"),
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
    case actionTypes.STORE_PROVINCE_OPTIONS:
      return {
        ...state,
        provinceOptions: action.payload.options,
      };
    case actionTypes.OPTIONS_LOADED:
      return {
        ...state,
        optionsLoaded: action.payload,
      };
    case actionTypes.STORE_PERMIT_STATUS_OPTIONS:
      return {
        ...state,
        permitStatusCodes: action.payload,
      };
    case actionTypes.STORE_APPLICATION_STATUS_OPTIONS:
      return {
        ...state,
        applicationStatusCodes: action.payload,
      };
    case actionTypes.STORE_COMPLIANCE_CODES:
      return {
        ...state,
        complianceCodes: action.payload.records,
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
export const getProvinceOptions = (state) => state[STATIC_CONTENT].provinceOptions;
export const getOptionsLoaded = (state) => state[STATIC_CONTENT].optionsLoaded;
export const getPermitStatusOptions = (state) => state[STATIC_CONTENT].permitStatusCodes;
export const getApplicationStatusOptions = (state) => state[STATIC_CONTENT].applicationStatusCodes;
export const getComplianceCodes = (state) => state[STATIC_CONTENT].complianceCodes;

export default staticContentReducer;
