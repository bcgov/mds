import { createSelector } from "reselect";
import { reportReducerType } from "@mds/common/redux/slices/reportSlice";

export const getReports = (state) => state[reportReducerType].reports;
export const getReportsPageData = (state) => state[reportReducerType].reportsPageData;
export const getMineReports = (state) => state[reportReducerType].mineReports;
export const getMineReportById = (state, reportGuid) => {
  if (reportGuid == state[reportReducerType].mineReportGuid) {
    return state[reportReducerType].mineReports[0];
  }
  return state[reportReducerType].mineReports.find((report) => report.mine_report_guid == reportGuid);
};
export const getMineReportComments = (state) => state[reportReducerType].reportComments;
export const getUpcomingMineReports = (state) => state[reportReducerType].upcomingMineReports;
export const getUpcomingReportsPageData = (state) => state[reportReducerType].upcomingReportsPageData;

export const getMineTSFReports = createSelector([getMineReports], (reports) =>
  reports.filter((report) => report.mine_report_definition_guid !== null)
);
