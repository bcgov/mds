import { createSelector } from "reselect";
import * as reportReducer from "../reducers/reportReducer";

export const {
  getReports,
  getReportsPageData,
  getMineReports,
  getMineReportById,
  getMineReportComments,
} = reportReducer;

export const getUpcomingReportsPageData = (state) => reportReducer.getUpcomingReportsPageData(state);
export const getUpcomingMineReports = (state) => reportReducer.getUpcomingMineReports(state);

export const getMineTSFReports = createSelector([getMineReports], (reports) =>
  reports.filter((report) => report.mine_report_definition_guid !== null)
);
