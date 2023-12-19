/* eslint-disable */
import * as ActionTypes from "@mds/core-web/src/constants/actionTypes";

export const storeDocumentContextTemplate = (payload) => ({
  type: ActionTypes.STORE_DOCUMENT_CONTEXT_TEMPLATE,
  payload,
});

export const storeDocumentCompressionProgress = (payload) => ({
  type: ActionTypes.STORE_DOCUMENT_COMPRESSION_PROGRESS,
  payload,
});
