import { createSelector } from "reselect";
import { isEmpty } from "lodash";
import * as projectReducer from "../reducers/projectReducer";

export const {
  getProjectSummary,
  getProjectSummaries,
  getProjectSummaryPageData,
  getProject,
  getProjects,
  getProjectPageData,
  getRequirements,
  getInformationRequirementsTable,
  getMajorMinesApplication,
  getProjectDecisionPackage,
  getProjectLinks,
} = projectReducer;

export const getFormattedProjectSummary = createSelector(
  [getProjectSummary, getProject],
  (summary, project) => {
    let formattedSummary = { ...summary, authorizationOptions: [] };
    if (!isEmpty(summary) && summary?.authorizations.length) {
      summary.authorizations.forEach((authorization) => {
        formattedSummary = {
          ...formattedSummary,
          [authorization.project_summary_authorization_type]: {
            ...authorization,
            existing_permits_authorizations: authorization.existing_permits_authorizations.toString(),
          },
        };
        return formattedSummary.authorizationOptions.push(
          authorization.project_summary_authorization_type
        );
      });
    }
    formattedSummary.project_lead_party_guid = project.project_lead_party_guid;

    return formattedSummary;
  }
);
