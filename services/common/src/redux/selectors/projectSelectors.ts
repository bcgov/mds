import { createSelector } from "reselect";
import { uniq } from "lodash";
import * as projectReducer from "../reducers/projectReducer";
import { IParty, IProjectContact } from "../..";
import { getTransformedProjectSummaryAuthorizationTypes } from "./staticContentSelectors";

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
const formatAuthorizations = (authorizations = [], authTypes) => {
  const authorizationTypes = uniq(authorizations.map((a) => a.project_summary_authorization_type));
  const formattedAuthorizations = {};

  authorizationTypes.forEach((type) => {
    const authsOfType = authorizations.filter((a) => a.project_summary_authorization_type === type);
    if (authTypes.includes(type)) {
      const amendAuths = authsOfType.filter(
        (a) => a.project_summary_permit_type[0] === "AMENDMENT"
      );
      const newAuths = authsOfType.filter((a) => a.project_summary_permit_type[0] === "NEW");
      const types = [amendAuths.length && "AMENDMENT", newAuths.length && "NEW"].filter(Boolean);

      const authData = { types, NEW: newAuths, AMENDMENT: amendAuths };
      formattedAuthorizations[type] = authData;
    } else {
      formattedAuthorizations[type] = authsOfType;
    }
  });
  return { authorizations: formattedAuthorizations, authorizationTypes };
};

export const getAmsAuthorizationTypes = createSelector(
  [getTransformedProjectSummaryAuthorizationTypes],
  (authTypes) => {
    return authTypes
      ?.find((parent) => parent.code === "ENVIRONMENTAL_MANAGMENT_ACT")
      ?.children?.map((c) => c.code);
  }
);

export const getFormattedProjectSummary = createSelector(
  [getProjectSummary, getProject, getAmsAuthorizationTypes],
  (summary, project, authTypes) => {
    const contacts = formatProjectContact(project.contacts);
    const agent = formatProjectSummaryParty(summary.agent);
    const facility_operator = formatProjectSummaryParty(summary.facility_operator);

    const formattedSummary = {
      ...summary,
      contacts,
      agent,
      facility_operator,
      ...formatAuthorizations(summary.authorizations, authTypes),
    };

    formattedSummary.project_lead_party_guid = project.project_lead_party_guid;

    return formattedSummary;
  }
);
