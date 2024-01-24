import { createSelector } from "reselect";
import { isEmpty } from "lodash";
import * as projectReducer from "../reducers/projectReducer";
import { IParty } from "../..";

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

const formatProjectSummaryAgent = (agent): IParty => {
  if (!agent || !agent.party_guid) {
    return agent;
  }
  return { ...agent, address: agent.address[0] };
};

export const getFormattedProjectSummary = createSelector(
  [getProjectSummary, getProject],
  (summary, project) => {
    const agent = formatProjectSummaryAgent(summary.agent);
    let formattedSummary = { ...summary, agent, authorizationOptions: [] };
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
