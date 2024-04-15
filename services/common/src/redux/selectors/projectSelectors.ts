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
const formatAuthorizations = (authorizations = [], amsAuthTypes, statusCode) => {
  const authorizationTypes = uniq(authorizations.map((a) => a.project_summary_authorization_type));
  const formattedAuthorizations = {};
  let ams_terms_agreed = false;

  authorizationTypes.forEach((type) => {
    const authsOfType = authorizations.filter((a) => a.project_summary_authorization_type === type);
    if (amsAuthTypes.includes(type)) {
      const amendAuths = authsOfType.filter(
        (a) => a.project_summary_permit_type[0] === "AMENDMENT"
      );
      const newAuths = authsOfType.filter((a) => a.project_summary_permit_type[0] === "NEW");
      const types = [amendAuths.length && "AMENDMENT", newAuths.length && "NEW"].filter(Boolean);

      ams_terms_agreed = ams_terms_agreed || newAuths.length > 0 || amendAuths.length > 0;

      const authData = { types, NEW: newAuths, AMENDMENT: amendAuths };
      formattedAuthorizations[type] = authData;
    } else {
      formattedAuthorizations[type] = authsOfType;
    }
  });
  // ams terms will be true on load if record is submitted with ams auths
  ams_terms_agreed = ams_terms_agreed && statusCode === "SUB";
  return { authorizations: formattedAuthorizations, authorizationTypes, ams_terms_agreed };
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
  (summary, project, amsAuthTypes) => {
    const contacts = formatProjectContact(project.contacts);
    const agent = formatProjectSummaryParty(summary.agent);
    const facility_operator = formatProjectSummaryParty(summary.facility_operator);
    const confirmation_of_submission = summary.status_code === "SUB";

    const formattedSummary = {
      ...summary,
      contacts,
      agent,
      facility_operator,
      confirmation_of_submission,
      ...formatAuthorizations(summary.authorizations, amsAuthTypes, summary.status_code),
    };

    formattedSummary.project_lead_party_guid = project.project_lead_party_guid;

    return formattedSummary;
  }
);
