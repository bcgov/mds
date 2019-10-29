import * as actionTypes from "../constants/actionTypes";

export const storeNoticeOfWorkApplications = (payload) => ({
  type: actionTypes.STORE_NOTICE_OF_WORK_APPLICATIONS,
  payload,
});

export const storeNoticeOfWorkApplication = (payload) => ({
  type: actionTypes.STORE_NOTICE_OF_WORK_APPLICATION,
  payload,
});
