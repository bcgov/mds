import * as actionTypes from "@mds/common/constants/actionTypes";
import { REPORTS } from "@mds/common/constants/reducerTypes";

const initialState = {
  reports: [],
  reportsPageData: {},
  mineReports: [],
  mineReportGuid: "",
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
        mineReportGuid: "",
      };
    case actionTypes.CLEAR_MINE_REPORTS:
      return {
        ...state,
        mineReports: initialState.mineReports,
      };
    case actionTypes.STORE_MINE_REPORT:
      return {
        ...state,
        mineReports: [action.payload],
        mineReportGuid: action.payload.mine_report_guid,
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
export const getMineReportById = (state, reportGuid) => {
  if (reportGuid == state[REPORTS].mineReportGuid) {
    return state[REPORTS].mineReports[0];
  }
  return state[REPORTS].mineReports.find((report) => report.mine_report_guid == reportGuid);
};
export const getMineReportComments = (state) => state[REPORTS].reportComments;

export default reportReducerObject;
