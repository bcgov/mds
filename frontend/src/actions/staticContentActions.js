import * as ActionTypes from "../constants/actionTypes";

export const storeTenureTypes = (payload) => ({
  type: ActionTypes.STORE_TENURE_TYPES,
  payload,
});

export const storeStatusOptions = (payload) => ({
  type: ActionTypes.STORE_STATUS_OPTIONS,
  payload,
});

export const storeRegionOptions = (payload) => ({
  type: ActionTypes.STORE_REGION_OPTIONS,
  payload,
});

export const storeDisturbanceOptions = (payload) => ({
  type: ActionTypes.STORE_DISTURBANCE_OPTIONS,
  payload,
});

export const storeCommodityOptions = (payload) => ({
  type: ActionTypes.STORE_COMMODITY_OPTIONS,
  payload,
});

export const storeDocumentStatusOptions = (payload) => ({
  type: ActionTypes.STORE_DOCUMENT_STATUS_OPTIONS,
  payload,
});

export const storeMineTSFRequiredDocuments = (payload) => ({
  type: ActionTypes.STORE_MINE_TSF_REQUIRED_DOCUMENTS,
  payload,
});

export const storeProvinceCodes = (payload) => ({
  type: ActionTypes.STORE_PROVINCE_OPTIONS,
  payload,
});

export const storePermitStatusOptions = (payload) => ({
  type: ActionTypes.STORE_PERMIT_STATUS_OPTIONS,
  payload,
});

export const storeApplicationStatusOptions = (payload) => ({
  type: ActionTypes.STORE_APPLICATION_STATUS_OPTIONS,
  payload,
});

export const storeComplianceCodes = (payload) => ({
  type: ActionTypes.STORE_COMPLIANCE_CODES,
  payload,
});

export const storeIncidentDocumentTypeOptions = (payload) => ({
  type: ActionTypes.STORE_INCIDENT_DOCUMENT_TYPE_OPTIONS,
  payload,
});

export const storeMineIncidentFollowActionOptions = (payload) => ({
  type: ActionTypes.STORE_MINE_INCIDENT_FOLLOWUP_ACTION_OPTIONS,
  payload,
});

export const storeMineIncidentDeterminationOptions = (payload) => ({
  type: ActionTypes.STORE_MINE_INCIDENT_DETERMINATION_OPTIONS,
  payload,
});

export const storeMineIncidentStatusCodeOptions = (payload) => ({
  type: ActionTypes.STORE_MINE_INCIDENT_STATUS_CODE_OPTIONS,
  payload,
});

export const storeVarianceStatusOptions = (payload) => ({
  type: ActionTypes.STORE_VARIANCE_STATUS_OPTIONS,
  payload,
});

export const storeVarianceDocumentCategoryOptions = (payload) => ({
  type: ActionTypes.STORE_VARIANCE_DOCUMENT_CATEGORY_OPTIONS,
  payload,
});

export const storeMineReportDefinitionOptions = (payload) => ({
  type: ActionTypes.STORE_MINE_REPORT_DEFINITION_OPTIONS,
  payload,
});
