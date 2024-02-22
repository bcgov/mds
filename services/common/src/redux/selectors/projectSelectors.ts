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

const formatProjectSummaryParty = (party): IParty => {
  if (!party?.party_guid) {
    return party;
  }
  console.log(
    party,
    party.job_title_code,
    party.first_name,
    party.party_name,
    party.address.length
  );
  return { ...party, address: party.address[0] };
};

export const getFormattedProjectSummary = createSelector(
  [getProjectSummary, getProject],
  (summary, project) => {
    const agent = formatProjectSummaryParty(summary.agent);
    const facility_operator = formatProjectSummaryParty(summary.facility_operator);
    let formattedSummary = { ...summary, agent, facility_operator, authorizationOptions: [] };
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
