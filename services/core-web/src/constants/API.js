import queryString from "query-string";

// Document Generation

export const GET_NOTICE_OF_WORK_APPLICATION_DOCUMENT_CONTEXT_TEMPLATE = (
  documentTypeCode,
  context_guid
) =>
  `/now-applications/application-document-types/${documentTypeCode}?${queryString.stringify({
    context_guid,
  })}`;

export const GET_EXPLOSIVES_PERMIT_DOCUMENT_CONTEXT_TEMPLATE = (documentTypeCode, context_guid) =>
  `/mines/explosives-permit-document-types/${documentTypeCode}?${queryString.stringify({
    context_guid,
  })}`;

export const NOW_DOCUMENT_GENERATION = (token) =>
  `/documents/notice-of-work?${queryString.stringify(token)}`;

export const EXPLOSIVES_PERMIT_DOCUMENT_GENERATION = (token) =>
  `/documents/explosives-permit?${queryString.stringify(token)}`;

// NODs
export const NOTICE_OF_DEPARTURE_DOCUMENTS = (mineGuid) =>
  `/mines/${mineGuid}/notices-of-departure/documents`;
