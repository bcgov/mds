import * as ActionTypes from "../constants/actionTypes";

export const storeMineReports = (payload) => ({
  type: ActionTypes.STORE_MINE_REPORTS,
  payload,
});

export const storeMineReportComments = (payload) => ({
  type: ActionTypes.STORE_MINE_REPORT_COMMENTS,
  payload,
});

export const fetchMineReportComments = () => ({
  type: ActionTypes.FETCH_MINE_REPORT_COMMENTS,
});

export const submitMineReportComment = () => ({
  type: ActionTypes.SUBMIT_MINE_REPORT_COMMENT,
});

export const mineReportCommentCreated = () => ({
  type: ActionTypes.MINE_REPORT_COMMENT_CREATED,
});
