import * as actionTypes from "../constants/actionTypes";

export const storeVariances = (payload) => ({
  type: actionTypes.STORE_VARIANCES,
  payload,
});

export const storeVariance = (payload) => ({
  type: actionTypes.STORE_VARIANCE,
  payload,
});

export const storeVarianceStatusOptions = (payload) => ({
  type: actionTypes.STORE_VARIANCE_STATUS_OPTIONS,
  payload,
});

export const storeVarianceDocumentCategoryOptions = (payload) => ({
  type: actionTypes.STORE_VARIANCE_DOCUMENT_CATEGORY_OPTIONS,
  payload,
});

export const storeComplianceCodes = (payload) => ({
  type: actionTypes.STORE_COMPLIANCE_CODES,
  payload,
});
