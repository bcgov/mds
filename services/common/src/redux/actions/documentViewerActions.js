import * as actionTypes from "../constants/actionTypes";

export const openDocumentViewer = (payload) => ({
  type: actionTypes.OPEN_DOCUMENT_VIEWER,
  payload,
});

export const closeDocumentViewer = () => ({
  type: actionTypes.CLOSE_DOCUMENT_VIEWER,
});

export const updateDocumentViewerTitle = (payload) => ({
  type: actionTypes.UPDATE_DOCUMENT_VIEWER_TITLE,
  payload,
});
