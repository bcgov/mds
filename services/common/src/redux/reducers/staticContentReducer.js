import * as actionTypes from "@mds/common/constants/actionTypes";
import { STATIC_CONTENT } from "@mds/common/constants/reducerTypes";

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
  projectSummaryStatusCodes: [],
  projectSummaryDocumentTypes: [],
  informationRequirementsTableStatusCodes: [],
  informationRequirementsTableDocumentTypes: [],
  majorMineApplicationStatusCodes: [],
  majorMineApplicationDocumentTypes: [],
  mineReportDefinitionOptions: [],
  mineReportStatusOptions: [],
  mineReportCategoryOptions: [],
  partyRelationshipTypes: [],
  partyBusinessRoleOptions: [],
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
  permitConditionTypeOptions: [],
  permitConditionCategoryOptions: [],
  noticeOfWorkApplicationDelayOptions: [],
  applicationReasonCodeOptions: [],
  applicationSourceTypeCodeOptions: [],
  consequenceClassificationStatusCodeOptions: [],
  itrbExemptionStatusCodeOptions: [],
  TSFOperatingStatusCodeOptions: [],
  explosivesPermitStatus: [],
  explosivesPermitDocumentType: [],
  explosivesPermitMagazineType: [],
  EMLIContactTypes: [],
  projectSummaryAuthorizationTypes: [],
  projectSummaryPermitTypes: [],
  projectDecisionPackageStatusCodes: [],
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
export const getGovernmentAgencyTypeOptions = (state) =>
  state[STATIC_CONTENT].governmentAgencyTypeOptions;
export const getMineTenureTypeOptions = (state) => state[STATIC_CONTENT].mineTenureTypes;
export const getMineDisturbanceOptions = (state) => state[STATIC_CONTENT].mineDisturbanceOptions;
export const getMineCommodityOptions = (state) => state[STATIC_CONTENT].mineCommodityOptions;
export const getProvinceOptions = (state) => state[STATIC_CONTENT].provinceOptions;
export const getPermitStatusOptions = (state) => state[STATIC_CONTENT].permitStatusCodes;
export const getPermitAmendmentTypeOptions = (state) =>
  state[STATIC_CONTENT].permitAmendmentTypeCodeOptions;
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
export const getProjectSummaryStatusCodes = (state) =>
  state[STATIC_CONTENT].projectSummaryStatusCodes;
export const getProjectSummaryDocumentTypes = (state) =>
  state[STATIC_CONTENT].projectSummaryDocumentTypes;
export const getInformationRequirementsTableStatusCodes = (state) =>
  state[STATIC_CONTENT].informationRequirementsTableStatusCodes;
export const getInformationRequirementsTableDocumentTypes = (state) =>
  state[STATIC_CONTENT].informationRequirementsTableDocumentTypes;
export const getMajorMinesApplicationStatusCodes = (state) =>
  state[STATIC_CONTENT].majorMineApplicationStatusCodes;
export const getMajorMinesApplicationDocumentTypes = (state) =>
  state[STATIC_CONTENT].majorMineApplicationDocumentTypes;
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
export const getPermitConditionCategoryOptions = (state) =>
  state[STATIC_CONTENT].permitConditionCategoryOptions;
export const getPermitConditionTypeOptions = (state) =>
  state[STATIC_CONTENT].permitConditionTypeOptions;
export const getPartyBusinessRoleOptions = (state) =>
  state[STATIC_CONTENT].partyBusinessRoleOptions;
export const getDelayTypeOptions = (state) =>
  state[STATIC_CONTENT].noticeOfWorkApplicationDelayOptions;
export const getApplicationReasonCodeOptions = (state) =>
  state[STATIC_CONTENT].applicationReasonCodeOptions;
export const getApplicationSourceTypeCodeOptions = (state) =>
  state[STATIC_CONTENT].applicationSourceTypeCodeOptions;
export const getConsequenceClassificationStatusCodeOptions = (state) =>
  state[STATIC_CONTENT].consequenceClassificationStatusCodeOptions;
export const getITRBExemptionStatusCodeOptions = (state) =>
  state[STATIC_CONTENT].itrbExemptionStatusCodeOptions;
export const getTSFOperatingStatusCodeOptions = (state) =>
  state[STATIC_CONTENT].TSFOperatingStatusCodeOptions;
export const getExplosivesPermitDocumentType = (state) =>
  state[STATIC_CONTENT].explosivesPermitDocumentType;
export const getExplosivesPermitStatus = (state) => state[STATIC_CONTENT].explosivesPermitStatus;
export const getExplosivesPermitMagazineType = (state) =>
  state[STATIC_CONTENT].explosivesPermitMagazineType;
export const getEMLIContactTypes = (state) => state[STATIC_CONTENT].EMLIContactTypes;
export const getProjectSummaryAuthorizationTypes = (state) =>
  state[STATIC_CONTENT].projectSummaryAuthorizationTypes;
export const getProjectSummaryPermitTypes = (state) =>
  state[STATIC_CONTENT].projectSummaryPermitTypes;
export const getProjectDecisionPackageStatusCodes = (state) =>
  state[STATIC_CONTENT].projectDecisionPackageStatusCodes;

const isStaticContentLoaded = (state) =>
  Object.keys(state)
    // eslint-disable-next-line no-prototype-builtins
    .filter((p) => state.hasOwnProperty(p) && Array.isArray(state[p]))
    .every((p) => state[p].length > 0);

export const getStaticContentLoadingIsComplete = (state) =>
  isStaticContentLoaded(state[STATIC_CONTENT]);

export default staticContentReducerObject;
