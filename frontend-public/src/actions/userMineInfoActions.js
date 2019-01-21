import * as ActionTypes from "../constants/actionTypes";

// This file is anticipated to have multiple exports
// eslint-disable-next-line import/prefer-default-export
export const storeUserMineInfo = (payload) => ({
  type: ActionTypes.STORE_USER_MINE_INFO,
  payload,
});

export const storeMine = (payload) => ({
  type: ActionTypes.STORE_MINE,
  payload,
});

export const storeDocumentStatusOptions = (payload) => ({
  type: ActionTypes.STORE_DOCUMENT_STATUS_OPTIONS,
  payload,
});

export const storeMineDocuments = (payload) => ({
  type: ActionTypes.STORE_MINE_DOCUMENTS,
  payload,
});
