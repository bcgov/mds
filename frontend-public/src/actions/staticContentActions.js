import * as ActionTypes from "../constants/actionTypes";

// This file is anticipated to have multiple exports
// eslint-disable-next-line import/prefer-default-export
export const storeDocumentStatusOptions = (payload) => ({
  type: ActionTypes.STORE_DOCUMENT_STATUS_OPTIONS,
  payload,
});
