import * as ActionTypes from "../constants/actionTypes";

export const storeReports = (payload) => ({
  type: ActionTypes.STORE_REPORTS,
  payload,
});

export const storeMineReports = (payload) => ({
  type: ActionTypes.STORE_MINE_REPORTS,
  payload,
});

export const storeMineReportComments = (payload) => ({
  type: ActionTypes.STORE_MINE_REPORT_COMMENTS,
  payload,
});

export const storeMineReportActionsDownloadState = (payload) => ({
  type: ActionTypes.STORE_MINE_REPORT_DOWNLOAD_STATE,
  payload,
});
