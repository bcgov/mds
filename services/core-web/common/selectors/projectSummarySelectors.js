/* eslint-disable */
import { createSelector } from "reselect";
import * as projectSummaryReducer from "../reducers/projectSummaryReducer";

export const {
  getProjectSummary,
  getProjectSummaries,
  getProjectSummaryPageData,
} = projectSummaryReducer;

export const getFormattedProjectSummary = createSelector([getProjectSummary], (summary) => {
  let formattedSummary = { ...summary };
  summary &&
    summary.authorizations.length > 0 &&
    summary.authorizations.map((authorization) => {
      return (formattedSummary = {
        project_summary_authorization_type: { ...authorization },
        ...formattedSummary,
      });
    });
  delete formattedSummary.authorizations;

  return formattedSummary;
});
