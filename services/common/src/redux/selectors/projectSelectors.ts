import { createSelector } from "reselect";
import { uniq } from "lodash";
import * as projectReducer from "../reducers/projectReducer";
import { IParty, IProjectContact, IProjectSummaryDocument } from "../..";
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

const formatProjectSummaryDocuments = (documents = []): IProjectSummaryDocument[] => {
  const allDocuments: any = { documents };
  const fieldNameMap = {
    support_documents: "SPR",
    spatial_documents: "SPT",
  };
  Object.entries(fieldNameMap).forEach(([fieldName, docTypeCode]) => {
    const matching = documents.filter(
      (doc) => doc.project_summary_document_type_code === docTypeCode
    );
    allDocuments[fieldName] = matching;
  });
  return allDocuments;
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
const formatAuthorizations = (amsAuthTypes, statusCode, authorizations = []) => {
  const authorizationTypes = uniq(authorizations?.map((a) => a.project_summary_authorization_type));
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
    const documents = formatProjectSummaryDocuments(summary.documents);
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
      ...formatAuthorizations(amsAuthTypes, summary.status_code, summary.authorizations),
      ...documents,
    };

    formattedSummary.project_lead_party_guid = project.project_lead_party_guid;

    return formattedSummary;
  }
);
