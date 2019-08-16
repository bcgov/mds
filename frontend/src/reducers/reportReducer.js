import * as actionTypes from "@/constants/actionTypes";
import { REPORTS } from "@/constants/reducerTypes";

const initialState = {
  mineReports: [],
  reportComments: [],
  commentsLoading: true,
  commentSubmitting: false,
};

const reportReducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.STORE_MINE_REPORTS:
      return {
        ...state,
        mineReports: action.payload.records,
      };
    case actionTypes.STORE_MINE_REPORT_COMMENTS:
      return {
        ...state,
        reportComments: action.payload.records,
        commentsLoading: false,
      };
    case actionTypes.FETCH_MINE_REPORT_COMMENTS:
      return {
        ...state,
        commentsLoading: true,
      };
    case actionTypes.SUBMIT_MINE_REPORT_COMMENT:
      return {
        ...state,
        commentSubmitting: true,
      };
    case actionTypes.MINE_REPORT_COMMENT_CREATED:
      return {
        ...state,
        commentSubmitting: false,
      };
    default:
      return state;
  }
};

export const getMineReports = (state) => state[REPORTS].mineReports;

export const getMineReportComments = (state) => state[REPORTS].reportComments;

export const getMineReportCommentLoading = (state) => state[REPORTS].commentsLoading;

export const getMineReportCommentSubmitting = (state) => state[REPORTS].commentSubmitting;

export default reportReducer;
