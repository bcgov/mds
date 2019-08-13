import * as ActionTypes from "../constants/actionTypes";

// eslint-disable-next-line import/prefer-default-export
export const storeMineReports = (payload) => ({
  type: ActionTypes.STORE_MINE_REPORTS,
  payload,
});

export const storeMineReportComments = (payload) => ({
  type: ActionTypes.STORE_MINE_REPORT_COMMENTS,
  payload,
});
