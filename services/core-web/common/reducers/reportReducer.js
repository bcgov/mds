import * as actionTypes from "../constants/actionTypes";
import { REPORTS } from "../constants/reducerTypes";

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
      };
    default:
      return state;
  }
};

const reportReducerObject = {
  [REPORTS]: reportReducer,
};

export const getMineReports = (state) => state[REPORTS].mineReports;

export const getMineReportComments = (state) => state[REPORTS].reportComments;

export default reportReducerObject;
