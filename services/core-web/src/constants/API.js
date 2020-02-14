import queryString from "query-string";

// Notices of Work
export const NOTICE_OF_WORK_APPLICATION_DOCUMENT = (documentTypeCode, token = {}) =>
  `/now-document-types/${documentTypeCode}?${queryString.stringify(token)}`;
export const NOTICE_OF_WORK_APPLICATION_DOCUMENT_GENERATION = (documentTypeCode) =>
  `/now-document-types/${documentTypeCode}/generate`;
export const NOTICE_OF_WORK_APPLICATION_DOCUMENT_TOKEN = (documentTypeCode) =>
  `/now-document-types/${documentTypeCode}/token`;
