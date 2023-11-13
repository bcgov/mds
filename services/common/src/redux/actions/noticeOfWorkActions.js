import * as actionTypes from "@mds/common/constants/actionTypes";

export const storeNoticeOfWorkApplications = (payload) => ({
  type: actionTypes.STORE_NOTICE_OF_WORK_APPLICATIONS,
  payload,
});

export const storeMineNoticeOfWorkApplications = (payload) => ({
  type: actionTypes.STORE_MINE_NOTICE_OF_WORK_APPLICATIONS,
  payload,
});

export const storeNoticeOfWorkApplication = (payload) => ({
  type: actionTypes.STORE_NOTICE_OF_WORK_APPLICATION,
  payload,
});

export const storeImportNoticeOfWorkSubmissionDocumentsJob = (payload) => ({
  type: actionTypes.STORE_IMPORT_NOTICE_OF_WORK_SUBMISSION_DOCUMENTS_JOB,
  payload,
});

export const clearNoticeOfWorkApplication = () => ({
  type: actionTypes.CLEAR_NOTICE_OF_WORK_APPLICATION,
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

export const storeNoticeOfWorkApplicationDelay = (payload) => ({
  type: actionTypes.STORE_NOTICE_OF_WORK_APPLICATION_DELAY,
  payload,
});
