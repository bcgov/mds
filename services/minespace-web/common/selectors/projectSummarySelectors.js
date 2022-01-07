import { createSelector } from "reselect";
import { isEmpty } from "lodash";
import * as projectSummaryReducer from "../reducers/projectSummaryReducer";

export const {
  getProjectSummary,
  getProjectSummaries,
  getProjectSummaryPageData,
} = projectSummaryReducer;

export const getFormattedProjectSummary = createSelector([getProjectSummary], (summary) => {
  let formattedSummary = { summary, authorizationOptions: [] };
  // console.log(summary);
  !isEmpty(summary) &&
    summary?.authorizations.length > 0 &&
    summary?.authorizations.map((authorization) => {
      formattedSummary = {
        summary: {
          ...formattedSummary.summary,
          [authorization.project_summary_authorization_type]: {
            ...authorization,
            existing_permits_authorizations: authorization.existing_permits_authorizations.toString(),
          },
        },
        ...formattedSummary,
      };
      formattedSummary.authorizationOptions.push(authorization.project_summary_authorization_type);
    });
  // delete formattedSummary.summary.authorizations;

  return formattedSummary;
});
