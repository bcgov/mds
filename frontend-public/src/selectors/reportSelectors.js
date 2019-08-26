import { createSelector } from "reselect";

import * as reportReducer from "@/reducers/reportReducer";

// eslint-disable-next-line import/prefer-default-export
export const { getMineReports } = reportReducer;

export const getMineTSFReports = createSelector(
  [getMineReports],
  (reports) =>
    reports.filter(
      (report) =>
        report.categories && report.categories.filter((x) => x.mine_report_category === "TSF")
    )
);
