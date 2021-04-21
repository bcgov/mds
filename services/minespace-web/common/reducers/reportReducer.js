import * as actionTypes from "../constants/actionTypes";
import { REPORTS } from "../constants/reducerTypes";

const initialState = {
  reports: [],
  reportsPageData: {},
  mineReports: [],
  reportComments: [],
};

export const reportReducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.STORE_REPORTS:
      return {
        ...state,
        reports: action.payload.records,
        reportsPageData: action.payload,
      };
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

export const getReports = (state) => state[REPORTS].reports;
export const getReportsPageData = (state) => state[REPORTS].reportsPageData;
export const getMineReports = (state) => state[REPORTS].mineReports;
export const getMineReportComments = (state) => state[REPORTS].reportComments;

export default reportReducerObject;
