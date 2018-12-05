import * as ActionTypes from "../constants/actionTypes";

export const updateMine = (payload) => ({
    type: ActionTypes.UPDATE_MINE_RECORD,
    payload,
  });

export const storeMineList = (payload) => ({
    type: ActionTypes.STORE_MINE_LIST,
    payload,
  });

export const storeMine = (payload, id) => ({
    type: ActionTypes.STORE_MINE,
    payload,
    id,
  });

export const storeMineNameList = (payload) => ({
    type: ActionTypes.STORE_MINE_NAME_LIST,
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

export const storeDocumentStatusOptions = (payload) => ({
    type: ActionTypes.STORE_DOCUMENT_STATUS_OPTIONS,
    payload,
  });

export const storeMineTSFRequiredDocuments = (payload) => ({
    type: ActionTypes.STORE_MINE_TSF_REQUIRED_DOCUMENTS,
    payload,
  });

export const storeTenureTypes = (payload) => ({
    type: ActionTypes.STORE_TENURE_TYPES,
    payload,
  });
