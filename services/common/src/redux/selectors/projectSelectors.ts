import { createSelector } from "reselect";
import { uniq } from "lodash";
import * as projectReducer from "../reducers/projectReducer";
import {
  FORM,
  IParty,
  IProjectContact,
  IProjectSummaryDocument,
  MAJOR_MINES_APPLICATION_DOCUMENT_TYPE_CODE,
  SystemFlagEnum,
} from "../..";
import { getTransformedProjectSummaryAuthorizationTypes } from "./staticContentSelectors";
import { getSystemFlag } from "@mds/common/redux/selectors/authenticationSelectors";
import { getFormValues } from "redux-form";

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
  getProjectSummaryMinistryComments,
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
    const matching = documents?.filter(
      (doc) => doc.project_summary_document_type_code === docTypeCode
    );
    allDocuments[fieldName] = matching;
  });
  return allDocuments;
};

const getContactName = (contact) => {
  if (!contact) {
    return;
  }

  const contactName = contact?.name ?? contact?.company_name;
  if (contactName) {
    return contactName;
  }

  return [contact?.first_name, contact?.last_name]
    .filter(Boolean)
    .join(" ")
    .trim();
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

export const getFormattedProjectApplication = createSelector(
  [getMajorMinesApplication, getProject],
  (app, project) => {
    const allDocuments = app?.documents ?? [];
    const primary_documents = allDocuments.filter(
      (d) =>
        d.major_mine_application_document_type_code ===
        MAJOR_MINES_APPLICATION_DOCUMENT_TYPE_CODE.PRIMARY
    );
    const spatial_documents = allDocuments.filter(
      (d) =>
        d.major_mine_application_document_type_code ===
        MAJOR_MINES_APPLICATION_DOCUMENT_TYPE_CODE.SPATIAL
    );
    const supporting_documents = allDocuments.filter(
      (d) =>
        d.major_mine_application_document_type_code ===
        MAJOR_MINES_APPLICATION_DOCUMENT_TYPE_CODE.SUPPORTING
    );

    const primaryContact = project?.contacts?.filter((contact) => contact.is_primary === true)[0];
    const primary_contact = getContactName(primaryContact);
    return { ...app, primary_documents, spatial_documents, supporting_documents, primary_contact };
  }
);

export const getFormattedProjectSummary = createSelector(
  [
    getProjectSummary,
    getProject,
    getAmsAuthorizationTypes,
    getSystemFlag,
    getFormValues(FORM.ADD_EDIT_PROJECT_SUMMARY),
  ],
  (summary, project, amsAuthTypes, systemFlag, formValues) => {
    const documents = formatProjectSummaryDocuments(summary.documents);
    const contacts = formatProjectContact(project.contacts);
    const agent = formatProjectSummaryParty(summary.agent);
    const facility_operator = formatProjectSummaryParty(summary.facility_operator);
    const confirmation_of_submission = summary.status_code === "SUB";

    const updatedSummary =
      systemFlag === SystemFlagEnum.core ? { ...summary, ...formValues } : summary;

    const formattedSummary = {
      ...updatedSummary,
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
