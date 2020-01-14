import * as actionTypes from "../constants/actionTypes";

export const storeNoticeOfWorkApplications = (payload) => ({
  type: actionTypes.STORE_NOTICE_OF_WORK_APPLICATIONS,
  payload,
});

export const storeNoticeOfWorkApplication = (payload) => ({
  type: actionTypes.STORE_NOTICE_OF_WORK_APPLICATION,
  payload,
});

export const storeOriginalNoticeOfWorkApplication = (payload) => ({
  type: actionTypes.STORE_ORIGINAL_NOTICE_OF_WORK_APPLICATION,
  payload,
});

export const storeNoticeOfWorkApplicationReviews = (payload) => ({
  type: actionTypes.STORE_NOTICE_OF_WORK_APPLICATION_REVIEWS,
  payload,
});

export const storeNoticeOfWorkApplicationDocumentDownloadState = (payload) => ({
  type: actionTypes.STORE_NOTICE_OF_WORK_APPLICATION_DOCUMENT_DOWNLOAD_STATE,
  payload,
});
