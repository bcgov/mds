import { createSelector } from "reselect";
import { REPORTS } from "@mds/common/constants/reducerTypes";

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
export const getUpcomingMineReports = (state) => state[REPORTS].upcomingMineReports;
export const getUpcomingReportsPageData = (state) => state[REPORTS].upcomingReportsPageData;

export const getMineTSFReports = createSelector([getMineReports], (reports) =>
  reports.filter((report) => report.mine_report_definition_guid !== null)
);
