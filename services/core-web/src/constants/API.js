import queryString from "query-string";

// Document Generation: Notices of Work

export const GET_NOTICE_OF_WORK_APPLICATION_DOCUMENT_CONTEXT_TEMPLATE = (
  documentTypeCode,
  context_guid
) =>
  `/now-applications/application-document-types/${documentTypeCode}?${queryString.stringify({
    context_guid,
  })}`;
export const DOCUMENT_GENERATION = (token) => `/documents?${queryString.stringify(token)}`;
