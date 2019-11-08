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
  provinceOptions: [],
  permitStatusCodes: [],
  complianceCodes: [],
  incidentFollowupActionOptions: [],
  incidentDeterminationOptions: [],
  incidentStatusCodeOptions: [],
  incidentCategoryCodeOptions: [],
  varianceStatusOptions: [],
  varianceDocumentCategoryOptions: [],
  mineReportDefinitionOptions: [],
  mineReportStatusOptions: [],
};

const staticContentReducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.STORE_STATUS_OPTIONS:
      return {
        ...state,
        mineStatusOptions: action.payload.records,
      };
    case actionTypes.STORE_REGION_OPTIONS:
      return {
        ...state,
        mineRegionOptions: action.payload.records,
      };
    case actionTypes.STORE_TENURE_TYPES:
      return {
        ...state,
        mineTenureTypes: action.payload.records,
      };
    case actionTypes.STORE_DISTURBANCE_OPTIONS:
      return {
        ...state,
        mineDisturbanceOptions: action.payload.records,
      };
    case actionTypes.STORE_COMMODITY_OPTIONS:
      return {
        ...state,
        mineCommodityOptions: action.payload.records,
      };
    case actionTypes.STORE_PROVINCE_OPTIONS:
      return {
        ...state,
        provinceOptions: action.payload.records,
      };
    case actionTypes.STORE_PERMIT_STATUS_OPTIONS:
      return {
        ...state,
        permitStatusCodes: action.payload.records,
      };
    case actionTypes.STORE_COMPLIANCE_CODES:
      return {
        ...state,
        complianceCodes: action.payload.records,
      };
    case actionTypes.STORE_INCIDENT_DOCUMENT_TYPE_OPTIONS:
      return {
        ...state,
        incidentDocumentTypeOptions: action.payload.records,
      };
    case actionTypes.STORE_MINE_INCIDENT_FOLLOWUP_ACTION_OPTIONS:
      return {
        ...state,
        incidentFollowupActionOptions: action.payload.records,
      };
    case actionTypes.STORE_MINE_INCIDENT_DETERMINATION_OPTIONS:
      return {
        ...state,
        incidentDeterminationOptions: action.payload.records,
      };
    case actionTypes.STORE_MINE_INCIDENT_STATUS_CODE_OPTIONS:
      return {
        ...state,
        incidentStatusCodeOptions: action.payload.records,
      };
    case actionTypes.STORE_MINE_INCIDENT_CATEGORY_CODE_OPTIONS:
      return {
        ...state,
        incidentCategoryCodeOptions: action.payload.records,
      };
    case actionTypes.STORE_VARIANCE_STATUS_OPTIONS:
      return {
        ...state,
        varianceStatusOptions: action.payload.records,
      };
    case actionTypes.STORE_VARIANCE_DOCUMENT_CATEGORY_OPTIONS:
      return {
        ...state,
        varianceDocumentCategoryOptions: action.payload.records,
      };
    case actionTypes.STORE_MINE_REPORT_DEFINITION_OPTIONS:
      return {
        ...state,
        mineReportDefinitionOptions: action.payload.records,
      };
    case actionTypes.STORE_MINE_REPORT_STATUS_OPTIONS:
      return {
        ...state,
        mineReportStatusOptions: action.payload.records,
      };
    default:
      return state;
  }
};

export const getMineStatusOptions = (state) => state[STATIC_CONTENT].mineStatusOptions;
export const getMineRegionOptions = (state) => state[STATIC_CONTENT].mineRegionOptions;
export const getMineTenureTypeOptions = (state) => state[STATIC_CONTENT].mineTenureTypes;
export const getMineDisturbanceOptions = (state) => state[STATIC_CONTENT].mineDisturbanceOptions;
export const getMineCommodityOptions = (state) => state[STATIC_CONTENT].mineCommodityOptions;
export const getProvinceOptions = (state) => state[STATIC_CONTENT].provinceOptions;
export const getPermitStatusOptions = (state) => state[STATIC_CONTENT].permitStatusCodes;
export const getComplianceCodes = (state) => state[STATIC_CONTENT].complianceCodes;
export const getIncidentDocumentTypeOptions = (state) =>
  state[STATIC_CONTENT].incidentDocumentTypeOptions;
export const getIncidentFollowupActionOptions = (state) =>
  state[STATIC_CONTENT].incidentFollowupActionOptions;
export const getIncidentDeterminationOptions = (state) =>
  state[STATIC_CONTENT].incidentDeterminationOptions;
export const getIncidentStatusCodeOptions = (state) =>
  state[STATIC_CONTENT].incidentStatusCodeOptions;
export const getIncidentCategoryCodeOptions = (state) =>
  state[STATIC_CONTENT].incidentCategoryCodeOptions;
export const getVarianceStatusOptions = (state) => state[STATIC_CONTENT].varianceStatusOptions;
export const getVarianceDocumentCategoryOptions = (state) =>
  state[STATIC_CONTENT].varianceDocumentCategoryOptions;
export const getMineReportDefinitionOptions = (state) =>
  state[STATIC_CONTENT].mineReportDefinitionOptions;
export const getMineReportStatusOptions = (state) => state[STATIC_CONTENT].mineReportStatusOptions;

export default staticContentReducer;
