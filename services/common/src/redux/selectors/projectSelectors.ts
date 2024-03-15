import { createSelector } from "reselect";
import { isEmpty } from "lodash";
import * as projectReducer from "../reducers/projectReducer";
import { IParty, IProjectContact } from "../..";

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

  return { ...party, address: party.address[0] };
};

const formatProjectContact = (contacts): IProjectContact[] => {
  if (!contacts) {
    return contacts;
  }

  const primaryContact = contacts.filter((contact) => contact.is_primary);
  const secondaryContacts = contacts.filter((contact) => !contact.is_primary);
  const formattedContacts = [...primaryContact, ...secondaryContacts].map((contact) => {
    return { ...contact, address: contact?.address?.[0] || null };
  });

  return formattedContacts;
};

export const getFormattedProjectSummary = createSelector(
  [getProjectSummary, getProject],
  (summary, project) => {
    const contacts = formatProjectContact(project.contacts);
    const agent = formatProjectSummaryParty(summary.agent);
    const facility_operator = formatProjectSummaryParty(summary.facility_operator);
    let formattedSummary = {
      ...summary,
      contacts,
      agent,
      facility_operator,
      authorizationOptions: [],
    };
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
