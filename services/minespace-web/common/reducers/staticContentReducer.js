import * as actionTypes from "../constants/actionTypes";
import { STATIC_CONTENT } from "../constants/reducerTypes";
import { createDropDownList } from "../utils/helpers";

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
  partyRelationshipTypes: [],
  noticeOfWorkActivityTypeOptions: [],
  noticeOfWorkUnitTypeOptions: [],
  noticeOfWorkApplicationTypeOptions: [],
  noticeOfWorkApplicationStatusOptions: [],
  noticeOfWorkApplicationDocumentTypeOptions: [],
  noticeOfWorkUndergroundExplorationTypeOptions: [],
  noticeOfWorkApplicationProgressStatusCodeOptions: [],
  noticeOfWorkApplicationPermitTypeOptions: [],
  noticeOfWorkApplicationReviewOptions: [],
  bondStatusOptions: [],
  bondTypeOptions: [],
  bondDocumentTypeOptions: [],
  exemptionFeeStatusOptions: [],
};

export const staticContentReducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.STORE_BULK_STATIC_CONTENT:
      return { ...state, ...action.payload };
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
export const getBondTypeOptions = (state) => state[STATIC_CONTENT].bondTypeOptions;
export const getBondStatusOptions = (state) => state[STATIC_CONTENT].bondStatusOptions;
export const getBondDocumentTypeOptions = (state) => state[STATIC_CONTENT].bondDocumentTypeOptions;
export const getExemptionFeeStatusOptions = (state) =>
  state[STATIC_CONTENT].exemptionFeeStatusOptions;
export const getPartyRelationshipTypes = (state) => state[STATIC_CONTENT].partyRelationshipTypes;

const isStaticContentLoaded = (state) =>
  Object.keys(state)
    // eslint-disable-next-line no-prototype-builtins
    .filter((p) => state.hasOwnProperty(p) && Array.isArray(state[p]))
    .every((p) => state[p].length > 0);

export const getStaticContentLoadingIsComplete = (state) =>
  isStaticContentLoaded(state[STATIC_CONTENT]);

export default staticContentReducerObject;
