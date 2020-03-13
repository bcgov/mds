import * as actionTypes from "../constants/actionTypes";
import { STATIC_CONTENT } from "../constants/reducerTypes";

/**
 * @file staticContentReducer.js
 * all data associated with static content to populate form inputs is handled within this reducer.
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
  mineReportCategoryOptions: [],
  noticeOfWorkActivityTypeOptions: [],
  noticeOfWorkUnitTypeOptions: [],
  noticeOfWorkApplicationTypeOptions: [],
  noticeOfWorkApplicationStatusOptions: [],
  noticeOfWorkApplicationDocumentTypeOptions: [],
  noticeOfWorkUndergroundExplorationTypeOptions: [],
  noticeOfWorkApplicationProgressStatusCodeOptions: [],
  noticeOfWorkApplicationPermitTypeOptions: [],
  noticeOfWorkApplicationReviewOptions: [],
};
export const staticContentReducer = (state = initialState, action) => {
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
    case actionTypes.STORE_MINE_REPORT_CATEGORY_OPTIONS:
      return {
        ...state,
        mineReportCategoryOptions: action.payload.records,
      };
    case actionTypes.STORE_NOTICE_OF_WORK_ACTIVITY_TYPE_OPTIONS:
      return {
        ...state,
        noticeOfWorkActivityTypeOptions: action.payload.records,
      };
    case actionTypes.STORE_NOTICE_OF_WORK_UNIT_TYPE_OPTIONS:
      return {
        ...state,
        noticeOfWorkUnitTypeOptions: action.payload.records,
      };
    case actionTypes.STORE_NOTICE_OF_WORK_APPLICATION_TYPE_OPTIONS:
      return {
        ...state,
        noticeOfWorkApplicationTypeOptions: action.payload.records,
      };
    case actionTypes.STORE_NOTICE_OF_WORK_APPLICATION_STATUS_OPTIONS:
      return {
        ...state,
        noticeOfWorkApplicationStatusOptions: action.payload.records,
      };
    case actionTypes.STORE_NOTICE_OF_WORK_APPLICATION_DOCUMENT_TYPE_OPTIONS:
      return {
        ...state,
        noticeOfWorkApplicationDocumentTypeOptions: action.payload.records,
      };
    case actionTypes.STORE_NOW_UNDERGROUND_EXPLORATION_TYPE_OPTIONS:
      return {
        ...state,
        noticeOfWorkUndergroundExplorationTypeOptions: action.payload.records,
      };
    case actionTypes.STORE_NOW_APPLICATION_PROGRESS_STATUS_CODES:
      return {
        ...state,
        noticeOfWorkApplicationProgressStatusCodeOptions: action.payload.records,
      };
    case actionTypes.STORE_NOW_APPLICATION_PERMIT_TYPES:
      return {
        ...state,
        noticeOfWorkApplicationPermitTypeOptions: action.payload.records,
      };
    case actionTypes.STORE_NOTICE_OF_WORK_APPLICATION_REVIEW_TYPES:
      return {
        ...state,
        noticeOfWorkApplicationReviewOptions: action.payload.records,
      };
    default:
      return state;
  }
};

const staticContentReducerObject = {
  [STATIC_CONTENT]: staticContentReducer,
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
export const getMineReportCategoryOptions = (state) =>
  state[STATIC_CONTENT].mineReportCategoryOptions;
export const getNoticeOfWorkActivityTypeOptions = (state) =>
  state[STATIC_CONTENT].noticeOfWorkActivityTypeOptions;
export const getNoticeOfWorkUnitTypeOptions = (state) =>
  state[STATIC_CONTENT].noticeOfWorkUnitTypeOptions;
export const getNoticeOfWorkApplicationTypeOptions = (state) =>
  state[STATIC_CONTENT].noticeOfWorkApplicationTypeOptions;
export const getNoticeOfWorkApplicationStatusOptions = (state) =>
  state[STATIC_CONTENT].noticeOfWorkApplicationStatusOptions;
export const getNoticeOfWorkApplicationDocumentTypeOptions = (state) =>
  state[STATIC_CONTENT].noticeOfWorkApplicationDocumentTypeOptions;
export const getNoticeOfWorkUndergroundExplorationTypeOptions = (state) =>
  state[STATIC_CONTENT].noticeOfWorkUndergroundExplorationTypeOptions;
export const getNoticeOfWorkApplicationProgressStatusCodeOptions = (state) =>
  state[STATIC_CONTENT].noticeOfWorkApplicationProgressStatusCodeOptions;
export const getNoticeOfWorkApplicationPermitTypeOptions = (state) =>
  state[STATIC_CONTENT].noticeOfWorkApplicationPermitTypeOptions;
export const getNoticeOfWorkApplicationReviewOptions = (state) =>
  state[STATIC_CONTENT].noticeOfWorkApplicationReviewOptions;

const isStaticContentLoaded = (state) =>
  Object.keys(state)
    // eslint-disable-next-line no-prototype-builtins
    .filter((p) => state.hasOwnProperty(p) && Array.isArray(state[p]))
    .every((p) => state[p].length > 0);

export const getStaticContentLoadingIsComplete = (state) =>
  isStaticContentLoaded(state[STATIC_CONTENT]);

export default staticContentReducerObject;
