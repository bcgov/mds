import * as ActionTypes from "@mds/common/constants/actionTypes";

export const storeReports = (payload) => ({
  type: ActionTypes.STORE_REPORTS,
  payload,
});

export const storeMineReports = (payload) => ({
  type: ActionTypes.STORE_MINE_REPORTS,
  payload,
});

export const clearMineReports = () => ({
  type: ActionTypes.CLEAR_MINE_REPORTS,
});

export const storeMineReport = (payload) => ({
  type: ActionTypes.STORE_MINE_REPORT,
  payload,
});

export const storeMineReportComments = (payload) => ({
  type: ActionTypes.STORE_MINE_REPORT_COMMENTS,
  payload,
});
