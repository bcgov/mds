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

export const loadedOptions = (payload) => ({
  type: ActionTypes.OPTIONS_LOADED,
  payload,
});

export const storeProvinceCodes = (payload) => ({
  type: ActionTypes.STORE_PROVINCE_OPTIONS,
  payload,
});
