import { createSelector } from "reselect";

import * as reportReducer from "../reducers/reportReducer";

export const { getMineReports } = reportReducer;

export const getMineTSFReports = createSelector([getMineReports], reports =>
  reports.filter(report => report.mine_report_definition_guid !== null)
);
export const { getMineReportComments } = reportReducer;
