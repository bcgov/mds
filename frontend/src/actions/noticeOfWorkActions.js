import * as actionTypes from "../constants/actionTypes";

export const storeNoticeOfWorkSubmissions = (payload) => ({
  type: actionTypes.STORE_NOTICE_OF_WORK_SUBMISSIONS,
  payload,
});

export const storeNoticeOfWorkSubmission = (payload) => ({
  type: actionTypes.STORE_NOTICE_OF_WORK_SUBMISSION,
  payload,
});
