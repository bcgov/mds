/* eslint-disable */
import * as ActionTypes from "../constants/actionTypes";

export const storeDocumentContextTemplate = (payload) => ({
  type: ActionTypes.STORE_DOCUMENT_CONTEXT_TEMPLATE,
  payload,
});

export const storeDocumentCompressionProgress = (payload) => ({
  type: ActionTypes.STORE_DOCUMENT_COMPRESSION_PROGRESS,
  payload,
});
